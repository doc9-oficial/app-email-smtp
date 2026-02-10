import docgo from "docgo-sdk";
import nodemailer from "nodemailer";

interface Anexo {
  nome: string;
  conteudo: string; // base64
}

interface EnviarEmailParams {
  para: string;
  assunto: string;
  mensagem: string;
  cc?: string;
  bcc?: string;
  html?: boolean;
  anexos?: Anexo[];
  provedor?: "smtp";
}

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

function normalizarAnexos(raw: unknown): Anexo[] {
  if (raw == null) return [];

  const items = Array.isArray(raw) ? raw : [raw];

  return items
    .filter(
      (item): item is Record<string, unknown> =>
        item != null && typeof item === "object",
    )
    .map((item) => ({
      nome: String(item.nome ?? item.name ?? "anexo"),
      conteudo: String(item.conteudo ?? item.content ?? ""),
    }))
    .filter((anexo) => anexo.conteudo.length > 0);
}

function montarAttachments(
  anexos: Anexo[],
): nodemailer.SendMailOptions["attachments"] {
  return anexos.map((anexo) => ({
    filename: anexo.nome,
    content: Buffer.from(anexo.conteudo, "base64"),
  }));
}

async function enviarEmailSMTP(params: EnviarEmailParams): Promise<any> {
  const smtpHost = docgo.getEnv("SMTP_HOST") || docgo.getEnv("host");
  const smtpPort = parseInt(
    docgo.getEnv("SMTP_PORT") || docgo.getEnv("port") || "587",
  );
  const smtpSecure =
    docgo.getEnv("SMTP_SECURE") === "true" ||
    docgo.getEnv("secure") === "true" ||
    true;
  const smtpUser = docgo.getEnv("SMTP_USER") || docgo.getEnv("user");
  const smtpPass = docgo.getEnv("SMTP_PASS") || docgo.getEnv("pass");
  const smtpFrom =
    docgo.getEnv("SMTP_FROM") || docgo.getEnv("from") || smtpUser || "";

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error(
      "Configuração SMTP incompleta. Configure host, user e pass.",
    );
  }

  const config: SMTPConfig = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
  };

  const transporter = nodemailer.createTransport(config);
  await transporter.verify();

  const anexos = params.anexos ?? [];

  const emailData: nodemailer.SendMailOptions = {
    from: smtpFrom,
    to: params.para,
    subject: params.assunto,
    text: params.html ? undefined : params.mensagem,
    html: params.html ? params.mensagem : undefined,
    cc: params.cc,
    bcc: params.bcc,
    ...(anexos.length > 0 && { attachments: montarAttachments(anexos) }),
  };

  const info = await transporter.sendMail(emailData);

  return {
    success: true,
    messageId: info?.messageId || `smtp_${Date.now()}`,
    config: {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
    },
    emailData: {
      from: smtpFrom,
      to: params.para,
      subject: params.assunto,
      cc: params.cc,
      bcc: params.bcc,
    },
    apiResponse: info,
  };
}

async function enviarEmail(params: any): Promise<void> {
  if (
    Array.isArray(params) &&
    params.length === 1 &&
    typeof params[0] === "object"
  ) {
    params = params[0];
  }

  try {
    if (!params.para) {
      return console.log(
        docgo.result(
          false,
          null,
          "É necessário informar o destinatário (para)",
        ),
      );
    }

    if (!params.assunto) {
      return console.log(
        docgo.result(false, null, "É necessário informar o assunto"),
      );
    }

    if (!params.mensagem) {
      return console.log(
        docgo.result(false, null, "É necessário informar a mensagem"),
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(params.para)) {
      return console.log(
        docgo.result(
          false,
          null,
          "Formato de email inválido para o destinatário",
        ),
      );
    }

    if (params.cc && !emailRegex.test(params.cc)) {
      return console.log(
        docgo.result(false, null, "Formato de email inválido para CC"),
      );
    }

    if (params.bcc && !emailRegex.test(params.bcc)) {
      return console.log(
        docgo.result(false, null, "Formato de email inválido para BCC"),
      );
    }

    const anexos = normalizarAnexos(params.anexos);

    const paramsEnvio: EnviarEmailParams = {
      para: params.para,
      assunto: params.assunto,
      mensagem: params.mensagem,
      cc: params.cc,
      bcc: params.bcc,
      html: params.html,
      ...(anexos.length > 0 && { anexos }),
    };

    const resultado = await enviarEmailSMTP(paramsEnvio);

    const resposta = {
      sucesso: true,
      para: paramsEnvio.para,
      assunto: paramsEnvio.assunto,
      cc: paramsEnvio.cc,
      bcc: paramsEnvio.bcc,
      html: paramsEnvio.html || false,
      anexos: anexos.length,
      messageId: resultado.messageId,
      provedor: "smtp",
      timestamp: new Date().toISOString(),
    };

    return console.log(docgo.result(true, resposta));
  } catch (error: any) {
    return console.log(docgo.result(false, null, error.message));
  }
}

export default enviarEmail;
