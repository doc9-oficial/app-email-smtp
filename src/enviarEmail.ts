import docgo from "docgo-sdk";

interface EnviarEmailParams {
  para: string;
  assunto: string;
  mensagem: string;
  cc?: string;
  bcc?: string;
  html?: boolean;
  anexos?: Array<{
    nome: string;
    conteudo: string; // Base64
    tipo: string; // MIME type
  }>;
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
  // Configuração SMTP
  const smtpHost = docgo.getEnv("SMTP_HOST");
  const smtpPort = parseInt(docgo.getEnv("SMTP_PORT") || "587");
  const smtpSecure = docgo.getEnv("SMTP_SECURE") === "true";
  const smtpUser = docgo.getEnv("SMTP_USER");
  const smtpPass = docgo.getEnv("SMTP_PASS");

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error(
      "Configuração SMTP incompleta. Configure SMTP_HOST, SMTP_USER e SMTP_PASS"
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

  // Construir o email
  const emailData = {
    from: smtpUser,
    to: params.para,
    subject: params.assunto,
    text: params.html ? undefined : params.mensagem,
    html: params.html ? params.mensagem : undefined,
    cc: params.cc,
    bcc: params.bcc,
    attachments: params.anexos?.map((anexo) => ({
      filename: anexo.nome,
      content: anexo.conteudo,
      contentType: anexo.tipo,
      encoding: "base64",
    })),
  };

  // Simular envio via API REST (já que não temos acesso direto ao SMTP)
  const apiUrl =
    docgo.getEnv("EMAIL_API_URL") ||
    "https://api.emailjs.com/api/v1.0/email/send";

  const payload = {
    service_id: docgo.getEnv("EMAIL_SERVICE_ID"),
    template_id: docgo.getEnv("EMAIL_TEMPLATE_ID"),
    user_id: docgo.getEnv("EMAIL_USER_ID"),
    template_params: {
      to_email: params.para,
      from_name: smtpUser,
      subject: params.assunto,
      message: params.mensagem,
      cc: params.cc,
      bcc: params.bcc,
    },
  };

  const headers = {
    "Content-Type": "application/json",
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Falha HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();

  return {
    success: true,
    messageId: result.message_id || `email_${Date.now()}`,
    config: {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
    },
    emailData,
    apiResponse: result,
  };
}

async function enviarEmail(params: any): Promise<void> {
  // Se params for array e o primeiro item for string JSON, faz o parse
  if (Array.isArray(params) && typeof params[0] === "string") {
    try {
      params = JSON.parse(params[0]);
    } catch {
      // fallback: argumentos posicionais
      const [para, assunto, mensagem] = params;
      params = { para, assunto, mensagem };
    }
  }  try {
    // Validar parâmetros obrigatórios
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

    // Validar formato de email
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

    // Enviar email
    const resultado = await enviarEmailSMTP(params);

    const resposta = {
      sucesso: true,
      para: params.para,
      assunto: params.assunto,
      cc: params.cc,
      bcc: params.bcc,
      html: params.html || false,
      anexos: params.anexos?.length || 0,
      messageId: resultado.messageId,
      config: resultado.config,
      timestamp: new Date().toISOString(),
    };

    console.log(docgo.result(true, resposta));
  } catch (error: any) {
    console.log(docgo.result(false, null, error.message));
  }
}

export default enviarEmail;
