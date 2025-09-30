# Email App - DocGo

Aplicação para envio de emails via SMTP.

## 🚀 Funcionalidades

- ✅ Envio de emails via SMTP
- ✅ Suporte a CC e BCC
- ✅ Formatação HTML e texto simples
- ✅ Validação de endereços de email
- ✅ Configuração flexível de servidor SMTP
- ✅ Tratamento de erros
- ✅ Integração com DocGo SDK

## 📋 Funções Disponíveis

### `enviarEmail`

Envia um email via SMTP.

**Parâmetros:**

- `para` (obrigatório): Endereço de email do destinatário
- `assunto` (obrigatório): Assunto do email
- `mensagem` (obrigatório): Conteúdo da mensagem
- `cc` (opcional): Endereço de email para cópia
- `bcc` (opcional): Endereço de email para cópia oculta
- `html` (opcional): Enviar mensagem em formato HTML

## ⚙️ Configuração

### Variáveis de Ambiente

Configure as seguintes variáveis de ambiente:

```bash
# Configuração SMTP (obrigatório)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app

# Configuração da API de Email (opcional)
EMAIL_API_URL=https://api.emailjs.com/api/v1.0/email/send
EMAIL_SERVICE_ID=seu-service-id
EMAIL_TEMPLATE_ID=seu-template-id
EMAIL_USER_ID=seu-user-id
```

### Configurações SMTP Comuns

#### Gmail

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
```

#### Outlook/Hotmail

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
```

#### Yahoo

```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@yahoo.com
SMTP_PASS=sua-senha-de-app
```

#### Servidor Personalizado

```bash
SMTP_HOST=mail.seudominio.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@seudominio.com
SMTP_PASS=sua-senha
```

## 🔐 Senhas de App

### Gmail

1. Ative a verificação em duas etapas
2. Gere uma senha de app específica
3. Use a senha de app no lugar da senha normal

### Outlook

1. Ative a autenticação de dois fatores
2. Gere uma senha de app
3. Use a senha de app no lugar da senha normal

## 🏗️ Build

```bash
# Build do projeto
./build.sh

# Ou manualmente
npm install
npx tsc
```

## 📝 Exemplo de Uso

```typescript
import enviarEmail from "./dist/enviarEmail.js";

// Enviar email simples
await enviarEmail({
  para: "destinatario@exemplo.com",
  assunto: "Assunto do email",
  mensagem: "Conteúdo da mensagem",
});

// Enviar email com CC e BCC
await enviarEmail({
  para: "destinatario@exemplo.com",
  assunto: "Assunto do email",
  mensagem: "Conteúdo da mensagem",
  cc: "copia@exemplo.com",
  bcc: "copia.oculta@exemplo.com",
});

// Enviar email em HTML
await enviarEmail({
  para: "destinatario@exemplo.com",
  assunto: "Email HTML",
  mensagem: "<h1>Título</h1><p>Parágrafo com <strong>negrito</strong></p>",
  html: true,
});
```

## 🔧 Estrutura do Projeto

```
email/
├── src/
│   └── enviarEmail.ts    # Função principal
├── dist/                 # Arquivos compilados
├── manifest.json        # Configuração do app
├── package.json        # Dependências
├── tsconfig.json       # Configuração TypeScript
├── build.sh           # Script de build
└── README.md          # Documentação
```

## 📊 Resposta da API

A função retorna:

```json
{
  "sucesso": true,
  "para": "destinatario@exemplo.com",
  "assunto": "Assunto do email",
  "cc": "copia@exemplo.com",
  "bcc": "copia.oculta@exemplo.com",
  "html": true,
  "anexos": 0,
  "messageId": "email_1640995200000",
  "config": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "user": "seu-email@gmail.com"
  },
  "timestamp": "2023-12-31T12:00:00.000Z"
}
```

## 🚨 Tratamento de Erros

A função trata os seguintes erros:

- **Configuração SMTP incompleta**: Verifica se todas as variáveis estão definidas
- **Parâmetros obrigatórios**: Valida para, assunto e mensagem
- **Formato de email inválido**: Valida formato dos endereços de email
- **Erros HTTP**: Trata falhas de conexão
- **Erros da API**: Trata erros específicos do serviço

## 📧 Formatação de Emails

### Texto Simples

```
Olá,

Este é um email em texto simples.

Atenciosamente,
Seu Nome
```

### HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Email HTML</title>
  </head>
  <body>
    <h1>Olá!</h1>
    <p>Este é um email em <strong>HTML</strong>.</p>
    <p>
      Você pode usar <em>formatação</em> e
      <a href="https://exemplo.com">links</a>.
    </p>
    <p>Atenciosamente,<br />Seu Nome</p>
  </body>
</html>
```

## 🔒 Segurança

### Boas Práticas

1. **Use senhas de app** em vez de senhas normais
2. **Nunca hardcode** credenciais no código
3. **Use variáveis de ambiente** para configurações sensíveis
4. **Valide** todos os endereços de email
5. **Limite** o tamanho das mensagens
6. **Use HTTPS** para conexões seguras

### Configuração Segura

```bash
# Use senhas de app
SMTP_PASS=senha-de-app-gerada

# Use portas seguras quando possível
SMTP_PORT=465  # SSL
SMTP_SECURE=true

# Ou use STARTTLS
SMTP_PORT=587  # STARTTLS
SMTP_SECURE=false
```

## 📚 Recursos Adicionais

- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Outlook SMTP Settings](https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-for-outlook-com-d088b986-291d-42b8-9564-9c414e2aa040)
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [SMTP Protocol](https://tools.ietf.org/html/rfc5321)
