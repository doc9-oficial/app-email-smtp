import docgo from "docgo-sdk";
import nodemailer from "nodemailer";

interface EnviarEmailParams {
  para: string;
  assunto: string;
  mensagem: string;
  cc?: string;
  bcc?: string;
  html?: boolean;
  anexos?: Array<{
    nome: string;
    conteudo: string;
    tipo: string; 
  }>;
  provedor?: "smtp"; // somente SMTP por enquanto
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

async function enviarEmailSMTP(params: EnviarEmailParams): Promise<any> {
  const smtpHost = docgo.getEnv("SMTP_HOST") || docgo.getEnv("host");
  const smtpPort = parseInt(docgo.getEnv("SMTP_PORT") || docgo.getEnv("port") || "587");
  const smtpSecure = docgo.getEnv("SMTP_SECURE") === "true" || docgo.getEnv("secure") === "true";
  const smtpUser = docgo.getEnv("SMTP_USER") || docgo.getEnv("user");
  const smtpPass = docgo.getEnv("SMTP_PASS") || docgo.getEnv("pass");
  const smtpFrom = docgo.getEnv("SMTP_FROM") || docgo.getEnv("from") || smtpUser || "";

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error(
      "Configuração SMTP incompleta. Configure host, user e pass."
    );
  }

  const config: SMTPConfig = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  };

  try {
    const transporter = nodemailer.createTransport(config);
    
    await transporter.verify();
    
    const emailData: nodemailer.SendMailOptions = {
      from: smtpFrom,
      to: params.para,
      subject: params.assunto,
      text: params.html ? undefined : params.mensagem,
      html: params.html ? params.mensagem : undefined,
      cc: params.cc,
      bcc: params.bcc,
      attachments: params.anexos?.map((anexo) => ({
        filename: anexo.nome,
        content: Buffer.from(anexo.conteudo, 'base64'),
        contentType: anexo.tipo
      }))
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
        bcc: params.bcc
      },
      apiResponse: info
    };
  } catch (error: any) {
    throw new Error(`Falha ao enviar email via SMTP: ${error.message}`);
  }
}

async function enviarEmail(params: any): Promise<void> {
  if (Array.isArray(params) && params.length === 1 && typeof params[0] === 'object') {
    params = params[0];
  }  
  try {
    if (!params.para) {
      console.log(
        docgo.result(false, null, "É necessário informar o destinatário (para)")
      );
      return;
    }

    if (!params.assunto) {
      console.log(docgo.result(false, null, "É necessário informar o assunto"));
      return;
    }

    if (!params.mensagem) {
      console.log(
        docgo.result(false, null, "É necessário informar a mensagem")
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.para)) {
      console.log(
        docgo.result(
          false,
          null,
          "Formato de email inválido para o destinatário"
        )
      );
      return;
    }

    if (params.cc && !emailRegex.test(params.cc)) {
      console.log(
        docgo.result(false, null, "Formato de email inválido para CC")
      );
      return;
    }

    if (params.bcc && !emailRegex.test(params.bcc)) {
      console.log(
        docgo.result(false, null, "Formato de email inválido para BCC")
      );
      return;
    }

    const provedor = params.provedor || "smtp";

    let resultado = await enviarEmailSMTP(params);
    const resposta = {
      sucesso: true,
      para: params.para,
      assunto: params.assunto,
      cc: params.cc,
      bcc: params.bcc,
      html: params.html || false,
      anexos: params.anexos?.length || 0,
      messageId: resultado.messageId,
      provedor,
      timestamp: new Date().toISOString(),
    };

    console.log(docgo.result(true, resposta));
  } catch (error: any) {
    console.log(docgo.result(false, null, error.message));
  }
}

export default enviarEmail;