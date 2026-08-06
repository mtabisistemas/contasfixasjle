import os
import sys
import json
import urllib.request
import datetime
import calendar
from PIL import Image, ImageDraw, ImageFont

# Configurações via variáveis de ambiente
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://vvbekmpzfznrfbhmxwah.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YmVrbXB6ZnpucmZiaG14d2FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA0NTExMSwiZXhwIjoyMTAxNjIxMTExfQ.KUICQoXFJWOaqLqgV7kx6FesCT0OudpUmO-FB7Yrsbo")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8776974965:AAGGvVaHwUqINKrIxcGg0jTa6UN7vy-KekU")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "-5576645321")
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://contasfixasjle.vercel.app")

def get_font(size: int, bold: bool = False):
    font_names = ["arialbd.ttf" if bold else "arial.ttf", "segoeui.ttf", "calibri.ttf"]
    for font_name in font_names:
        try:
            return ImageFont.truetype(font_name, size)
        except OSError:
            continue
    return ImageFont.load_default()

def get_mock_contas():
    return [
        {"id": 1, "dia_vencimento": 1, "descricao": "Aluguel Base SC"},
        {"id": 2, "dia_vencimento": 3, "descricao": "Aluguel Base NH"},
        {"id": 3, "dia_vencimento": 3, "descricao": "Água Base SC"},
        {"id": 4, "dia_vencimento": 8, "descricao": "RGE Terreno SL"},
        {"id": 5, "dia_vencimento": 10, "descricao": "Aluguel PR – AGUA VERDE"},
        {"id": 6, "dia_vencimento": 10, "descricao": "Aluguel AP SC"},
        {"id": 7, "dia_vencimento": 10, "descricao": "Condomínio SC"},
        {"id": 8, "dia_vencimento": 10, "descricao": "Consórcio HS"},
        {"id": 9, "dia_vencimento": 10, "descricao": "Rastreadores"},
        {"id": 10, "dia_vencimento": 10, "descricao": "Seguros Star"},
        {"id": 11, "dia_vencimento": 10, "descricao": "Claro NH"},
        {"id": 12, "dia_vencimento": 10, "descricao": "Sebratel SL"},
        {"id": 13, "dia_vencimento": 10, "descricao": "Luz APE – CELESC – SC"},
        {"id": 14, "dia_vencimento": 10, "descricao": "Luz – BASE CELESC SC"},
        {"id": 15, "dia_vencimento": 10, "descricao": "ALUGUEL – DESTAK – SC"},
        {"id": 16, "dia_vencimento": 10, "descricao": "ALUGUEL – CONQUISTA – SL"},
        {"id": 17, "dia_vencimento": 15, "descricao": "Ticket Combustível"},
        {"id": 18, "dia_vencimento": 15, "descricao": "CLARO SC"},
        {"id": 19, "dia_vencimento": 15, "descricao": "RECH TEC"},
        {"id": 20, "dia_vencimento": 15, "descricao": "RECH JLE"},
        {"id": 21, "dia_vencimento": 15, "descricao": "SMARTEC"},
        {"id": 22, "dia_vencimento": 17, "descricao": "Contas Vivo e Claro"},
        {"id": 23, "dia_vencimento": 18, "descricao": "Parcela Fluence"},
        {"id": 24, "dia_vencimento": 18, "descricao": "RGE Base SL"},
        {"id": 25, "dia_vencimento": 20, "descricao": "CLARO PR"},
        {"id": 26, "dia_vencimento": 24, "descricao": "AGUA – COMUSA NH"},
        {"id": 27, "dia_vencimento": 30, "descricao": "TICKET COMBUSTIVEL"}
    ]

def fetch_contas():
    if not SUPABASE_URL or not SUPABASE_KEY:
        return get_mock_contas()

    try:
        req_contas = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/contas?ativa=eq.true&order=dia_vencimento.asc",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
        )
        with urllib.request.urlopen(req_contas) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data if data else get_mock_contas()
    except Exception as e:
        print("Aviso Supabase (usando contas padrão):", e)
        return get_mock_contas()

def gerar_imagem_calendario(contas, mes: int, ano: int) -> str:
    """Gera o calendário visual estilizado com as cores e logo oficial da JLE Telecom."""
    contas_por_dia = {}
    for c in contas:
        dia = c["dia_vencimento"]
        contas_por_dia.setdefault(dia, []).append(c)

    WIDTH = 1200
    HEIGHT = 920
    HEADER_HEIGHT = 110
    DAYS_HEADER_HEIGHT = 42
    MARGIN = 20

    JLE_NAVY = (16, 78, 112)       # #104E70
    JLE_NAVY_DARK = (11, 51, 75)   # #0B334B
    JLE_ORANGE = (243, 146, 31)    # #F3921F
    BG_MAIN = (244, 247, 249)

    img = Image.new("RGB", (WIDTH, HEIGHT), BG_MAIN)
    draw = ImageDraw.Draw(img)

    title_font = get_font(26, bold=True)
    subtitle_font = get_font(15)
    day_header_font = get_font(15, bold=True)
    day_num_font = get_font(16, bold=True)
    item_font = get_font(12, bold=True)

    meses_pt = ["", "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"]
    
    # Cabeçalho Principal JLE Telecom
    draw.rectangle([0, 0, WIDTH, HEADER_HEIGHT], fill=JLE_NAVY_DARK)
    draw.rectangle([0, HEADER_HEIGHT - 4, WIDTH, HEADER_HEIGHT], fill=JLE_ORANGE)

    # Logo Oficial JLE Telecom (Branco e Laranja transparente)
    logo_path = r"C:\Users\jlema\.gemini\antigravity\scratch\contas_fixas_app\public\jle_logo.png"
    text_x_offset = MARGIN
    if os.path.exists(logo_path):
        try:
            logo_img = Image.open(logo_path).convert("RGBA")
            logo_img.thumbnail((140, 75))
            
            logo_y = (HEADER_HEIGHT - logo_img.height) // 2
            img.paste(logo_img, (MARGIN, logo_y), logo_img)
            text_x_offset = MARGIN + logo_img.width + 20
        except Exception as e:
            print("Aviso logo:", e)

    draw.text((text_x_offset, 25), f"CALENDÁRIO DE CONTAS FIXAS - {meses_pt[mes]} {ano}", fill=(255, 255, 255), font=title_font)
    draw.text((text_x_offset, 65), f"JLE TELECOM  |  Total de {len(contas)} contas fixas agendadas", fill=(209, 228, 240), font=subtitle_font)

    # Grid do Calendário
    cal = calendar.Calendar(firstweekday=6)
    month_days = cal.monthdayscalendar(ano, mes)
    dias_semana = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"]
    col_width = (WIDTH - 2 * MARGIN) // 7
    grid_top = HEADER_HEIGHT + MARGIN

    for col_idx, d_name in enumerate(dias_semana):
        x1 = MARGIN + col_idx * col_width
        y1 = grid_top
        x2 = x1 + col_width - 4
        y2 = y1 + DAYS_HEADER_HEIGHT
        draw.rectangle([x1, y1, x2, y2], fill=JLE_NAVY)
        draw.text((x1 + (col_width - 45) // 2, y1 + 11), d_name[:3], fill=(255, 255, 255), font=day_header_font)

    num_rows = len(month_days)
    row_height = (HEIGHT - grid_top - DAYS_HEADER_HEIGHT - MARGIN) // num_rows
    agora = datetime.datetime.now()

    for row_idx, week in enumerate(month_days):
        for col_idx, day_num in enumerate(week):
            x1 = MARGIN + col_idx * col_width
            y1 = grid_top + DAYS_HEADER_HEIGHT + row_idx * row_height
            x2 = x1 + col_width - 4
            y2 = y1 + row_height - 4

            if day_num == 0:
                draw.rectangle([x1, y1, x2, y2], fill=(236, 239, 243))
                continue

            is_today = (day_num == agora.day and mes == agora.month and ano == agora.year)
            bg = (254, 246, 236) if is_today else (255, 255, 255)
            border_color = JLE_ORANGE if is_today else (225, 232, 237)

            draw.rectangle([x1, y1, x2, y2], fill=bg, outline=border_color, width=2 if is_today else 1)
            
            # Número do Dia
            if is_today:
                draw.ellipse([x1 + 6, y1 + 5, x1 + 30, y1 + 29], fill=JLE_ORANGE)
                draw.text((x1 + 12, y1 + 7), str(day_num), fill=(255, 255, 255), font=day_num_font)
            else:
                draw.text((x1 + 6, y1 + 5), str(day_num), fill=JLE_NAVY, font=day_num_font)

            contas_dia = contas_por_dia.get(day_num, [])
            curr_y = y1 + 32
            max_lines = (row_height - 35) // 16

            for idx, c in enumerate(contas_dia):
                if idx >= max_lines:
                    draw.text((x1 + 6, curr_y), f"+ {len(contas_dia) - idx} mais...", fill=(120, 120, 120), font=item_font)
                    break

                draw.rectangle([x1 + 6, curr_y + 3, x1 + 10, curr_y + 11], fill=JLE_NAVY)
                desc_trunc = c["descricao"][:13] + ".." if len(c["descricao"]) > 14 else c["descricao"]
                draw.text((x1 + 14, curr_y), desc_trunc, fill=(30, 45, 60), font=item_font)
                curr_y += 16

    file_path = f"calendario_cloud_jle.png"
    img.save(file_path, "PNG")
    return file_path

def send_telegram_photo(photo_path: str, caption: str):
    """Envia a foto com o botão inline 'Calendário (Senha Jle@2026)'."""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto"
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    
    reply_markup = {
        "inline_keyboard": [
            [
                {
                    "text": "Calendário (Senha Jle@2026)",
                    "url": WEB_APP_URL
                }
            ]
        ]
    }

    body = []
    
    body.append(f"--{boundary}".encode())
    body.append(f'Content-Disposition: form-data; name="chat_id"'.encode())
    body.append("".encode())
    body.append(str(TELEGRAM_CHAT_ID).encode())

    body.append(f"--{boundary}".encode())
    body.append(f'Content-Disposition: form-data; name="parse_mode"'.encode())
    body.append("".encode())
    body.append("Markdown".encode())

    body.append(f"--{boundary}".encode())
    body.append(f'Content-Disposition: form-data; name="caption"'.encode())
    body.append("".encode())
    body.append(caption.encode("utf-8"))

    body.append(f"--{boundary}".encode())
    body.append(f'Content-Disposition: form-data; name="reply_markup"'.encode())
    body.append("".encode())
    body.append(json.dumps(reply_markup).encode("utf-8"))

    body.append(f"--{boundary}".encode())
    body.append(f'Content-Disposition: form-data; name="photo"; filename="calendario_jle.png"'.encode())
    body.append('Content-Type: image/png'.encode())
    body.append("".encode())

    with open(photo_path, "rb") as f:
        file_bytes = f.read()

    full_body = b"\r\n".join(body) + b"\r\n" + file_bytes + b"\r\n--" + boundary.encode() + b"--\r\n"

    req = urllib.request.Request(
        url,
        data=full_body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    with urllib.request.urlopen(req) as resp:
        print("Notificação JLE enviada com sucesso para o Telegram com o novo botão!")

def main():
    agora = datetime.datetime.now()
    contas = fetch_contas()
    photo_path = gerar_imagem_calendario(contas, agora.month, agora.year)

    contas_hoje = [c for c in contas if c["dia_vencimento"] == agora.day]

    # Busca Vencimentos nos Próximos 3 Dias
    dias_semana_pt = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
    proximos_dias = []
    
    for i in range(1, 4):
        data_futura = agora + datetime.timedelta(days=i)
        dia_f = data_futura.day
        nome_dia_semana = dias_semana_pt[data_futura.weekday()]
        contas_f = [c for c in contas if c["dia_vencimento"] == dia_f]
        if contas_f:
            proximos_dias.append((dia_f, nome_dia_semana, contas_f))

    mensagem = [f"📶 *JLE TELECOM - LEMBRETE DE CONTAS FIXAS*\n📅 *Data:* {agora.strftime('%d/%m/%Y')}\n"]

    # 1. Seção VENCEM HOJE
    if contas_hoje:
        mensagem.append(f"🚨 *VENCEM HOJE (Dia {agora.day:02d}):*")
        for c in contas_hoje:
            mensagem.append(f"• *{c['descricao']}*")
        mensagem.append("")
    else:
        mensagem.append("✨ *Nenhuma conta vence no dia de HOJE.*\n")

    # 2. Seção VENCIMENTOS NOS PRÓXIMOS 3 DIAS
    mensagem.append("🗓️ *VENCIMENTOS NOS PRÓXIMOS 3 DIAS:*")
    if proximos_dias:
        for dia_f, dia_semana, lista in proximos_dias:
            for c in lista:
                mensagem.append(f"• *Dia {dia_f:02d} ({dia_semana})*: {c['descricao']}")
    else:
        mensagem.append("✨ Nenhuma conta agendada para os próximos 3 dias.")

    caption = "\n".join(mensagem)
    send_telegram_photo(photo_path, caption)

if __name__ == "__main__":
    main()
