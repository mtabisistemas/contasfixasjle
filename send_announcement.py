import os
import json
import urllib.request

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8776974965:AAGGvVaHwUqINKrIxcGg0jTa6UN7vy-KekU")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "-5576645321")
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://contasfixasjle.vercel.app")

def send_announcement():
    message_text = (
        "📢 <b>LEMBRETE AUTOMÁTICO DE CONTAS FIXAS</b> 🤖\n\n"
        "Pessoal, a partir de hoje, teremos um <b>Robô automático</b> notificando o grupo todos os dias às <b>08:00h</b> da manhã!\n\n"
        "Ele lembrará a equipe sobre: \n"
        "📌 <b>Contas a pagar HOJE</b>\n"
        "📌 <b>Contas que vencem nos PRÓXIMOS 3 DIAS</b>\n\n"
        "Abaixo da notificação terá um botão que direciona para o <b>Calendário Financeiro</b>, que substitui a planilha. Pelo calendário podemos lançar novas contas e mudar datas de vencimento diretamente.\n\n"
        "🔑 Para acessar o calendário basta clicar no botão abaixo e inserir a <b>Senha de Acesso:</b> <code>Jle@2026</code>\n\n"
        "Bom trabalho a todos! 👏"
    )

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message_text,
        "parse_mode": "HTML",
        "reply_markup": {
            "inline_keyboard": [
                [
                    {
                        "text": "Calendário (Senha Jle@2026)",
                        "url": WEB_APP_URL
                    }
                ]
            ]
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )

    try:
        with urllib.request.urlopen(req) as resp:
            print("Mensagem de apresentação enviada com sucesso no grupo do Telegram!")
    except Exception as e:
        print("Erro ao enviar mensagem no Telegram:", e)

if __name__ == "__main__":
    send_announcement()
