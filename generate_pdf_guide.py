import os
from PIL import Image as PILImage
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, HRFlowable, KeepTogether
)

def get_image_flowable(path, max_w=450, max_h=280):
    if not os.path.exists(path):
        return None
    with PILImage.open(path) as img:
        w, h = img.size
        scale = min(max_w / float(w), max_h / float(h))
        new_w = w * scale
        new_h = h * scale
        return RLImage(path, width=new_w, height=new_h)

def create_guide_pdf(output_paths):
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#104E70'),
        spaceAfter=8
    )

    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=colors.HexColor('#104E70'),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0E2938'),
        spaceAfter=4
    )

    alert_style = ParagraphStyle(
        'DocAlert',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#0B334B'),
    )

    base_img_dir = r"C:\Users\Operador\.gemini\antigravity\brain\ee08e766-40f9-47a1-9687-fca91c7cfe00"

    story = []

    # Header section
    story.append(Paragraph("Guia de Uso Oficial: Contas Fixas JLE Telecom", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#F3921F"), spaceAfter=10))
    story.append(Paragraph("Este guia apresenta o passo a passo completo, ilustrado e intuitivo para operar o sistema de <b>Contas Fixas Financeiro da JLE Telecom</b>.", body_style))
    story.append(Spacer(1, 6))

    # Section 1: Telegram
    s1_elements = []
    s1_elements.append(Paragraph("1. Notificacao Automatica Diaria no Telegram", h2_style))
    telegram_box_text = Paragraph(
        "<b>Automacao Diaria as 08:00h</b><br/>"
        "Todos os dias, pontualmente as <b>08:00h da manha</b>, o sistema gera e envia automaticamente um relatorio de pagamentos no grupo oficial do Telegram: <b>Contas Fixas - Pagamentos</b>.<br/><br/>"
        "A mensagem detalha todas as contas fixas com vencimento no dia e disponibiliza o botao de acesso direto: <b>Calendario (Senha Jle@2026)</b>.<br/>"
        "Ao clicar no botao do Telegram, o sistema abre diretamente o painel web: <u>https://contasfixasjle.vercel.app</u>",
        alert_style
    )
    t_alert = Table([[telegram_box_text]], colWidths=[460])
    t_alert.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EBF5FA')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#104E70')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    s1_elements.append(t_alert)
    s1_elements.append(Spacer(1, 6))
    img1 = get_image_flowable(os.path.join(base_img_dir, "NOTIFICAÇÃO GRUPO.jpg"), max_w=460, max_h=250)
    if img1:
        s1_elements.append(img1)
    story.append(KeepTogether(s1_elements))
    story.append(Spacer(1, 12))

    # Section 2: Login
    s2_elements = []
    s2_elements.append(Paragraph("2. Acesso e Autenticacao (Login)", h2_style))
    s2_elements.append(Paragraph("1. Acesse o endereco do sistema: <b>https://contasfixasjle.vercel.app</b>", body_style))
    s2_elements.append(Paragraph("2. Digite a senha padrao de acesso: <b>Jle@2026</b>", body_style))
    s2_elements.append(Paragraph("3. Clique em <b>Acessar Painel</b>.", body_style))
    s2_elements.append(Spacer(1, 6))
    img2 = get_image_flowable(os.path.join(base_img_dir, "TELA DE LOGIN.png"), max_w=460, max_h=230)
    if img2:
        s2_elements.append(img2)
    story.append(KeepTogether(s2_elements))
    story.append(Spacer(1, 12))

    # Section 3: Visão Geral (Desktop + Mobile)
    s3_elements = []
    s3_elements.append(Paragraph("3. Visao Geral do Calendario (Desktop e Mobile)", h2_style))
    s3_elements.append(Paragraph("• <b>Seletor de Mes (&lt; AGOSTO 2026 &gt;)</b>: Alterne facilmente entre os meses.", body_style))
    s3_elements.append(Paragraph("• <b>Botao 'Hoje'</b>: Retorna rapidamente para a data atual.", body_style))
    s3_elements.append(Paragraph("• <b>Botao '+ Nova Conta'</b>: Abre o formulario para lancar uma nova conta.", body_style))
    s3_elements.append(Paragraph("• <b>Lista de Contas por Dia</b>: Quando um dia possui muitas contas (ex: dia 10), a rolagem ocorre suavemente dentro do proprio card do dia.", body_style))
    s3_elements.append(Spacer(1, 6))
    story.append(KeepTogether(s3_elements))

    # Desktop screenshot
    s3_desk = []
    s3_desk.append(Paragraph("<b>Visualizacao no Desktop:</b>", body_style))
    img3_desk = get_image_flowable(os.path.join(base_img_dir, "TELA PRINCIPAL - CALENDÁRIO (DESKTOP).png"), max_w=460, max_h=220)
    if img3_desk:
        s3_desk.append(img3_desk)
    story.append(KeepTogether(s3_desk))
    story.append(Spacer(1, 10))

    # Mobile screenshot
    s3_mob = []
    s3_mob.append(Paragraph("<b>Visualizacao no Mobile (Smartphones):</b>", body_style))
    img3_mob = get_image_flowable(os.path.join(base_img_dir, "TELA PRINCIPAL - CALENDÁRIO (MOBILE).png"), max_w=240, max_h=300)
    if img3_mob:
        s3_mob.append(img3_mob)
    story.append(KeepTogether(s3_mob))
    story.append(Spacer(1, 12))

    # Section 4: Lançar Nova Conta
    s4_elements = []
    s4_elements.append(Paragraph("4. Passo a Passo: Lancar uma Nova Conta Fixa", h2_style))
    s4_elements.append(Paragraph("1. No canto superior direito do cabecalho, clique no botao <b>+ Nova Conta</b>.", body_style))
    s4_elements.append(Paragraph("2. Preencha os dois campos do formulario:", body_style))
    s4_elements.append(Paragraph("   - <b>Dia do Vencimento (1 a 31)</b>: Digite o dia do mes (ex: 3).", body_style))
    s4_elements.append(Paragraph("   - <b>Descricao / Nome da Conta</b>: Digite o nome da despesa (ex: Aluguel Base NH).", body_style))
    s4_elements.append(Paragraph("3. Clique em <b>Salvar</b>.", body_style))
    s4_elements.append(Paragraph("4. O sistema exibira o modal de confirmacao: Clique em <b>Cadastrar</b> para confirmar a inclusao.", body_style))
    s4_elements.append(Spacer(1, 6))
    img4 = get_image_flowable(os.path.join(base_img_dir, "FORMULÁRIO NOVA CONTA.png"), max_w=460, max_h=240)
    if img4:
        s4_elements.append(img4)
    story.append(KeepTogether(s4_elements))
    story.append(Spacer(1, 12))

    # Section 5: Editar / Excluir
    s5_elements = []
    s5_elements.append(Paragraph("5. Passo a Passo: Editar ou Excluir uma Conta Existente", h2_style))
    s5_elements.append(Paragraph("1. Clique diretamente sobre a conta que deseja alterar no calendario (ex: Aluguel Base NH).", body_style))
    s5_elements.append(Paragraph("2. O formulario de edicao sera aberto com os campos preenchidos.", body_style))
    s5_elements.append(Spacer(1, 4))
    s5_elements.append(Paragraph("<b>Para Alterar:</b> Modifique o dia ou a descricao ➔ Clique em <b>Salvar</b> ➔ Confirme na caixa do sistema.", body_style))
    s5_elements.append(Paragraph("<b>Para Remover:</b> Clique no botao vermelho <b>Excluir</b> ➔ Confirme na caixa de seguranca (<b>Sim, Excluir</b>).", body_style))
    s5_elements.append(Spacer(1, 6))
    img5 = get_image_flowable(os.path.join(base_img_dir, "EDITAR OU REMOVER CONTA EXISTENTE.png"), max_w=460, max_h=240)
    if img5:
        s5_elements.append(img5)
    story.append(KeepTogether(s5_elements))

    for path in output_paths:
        doc = SimpleDocTemplate(
            path,
            pagesize=A4,
            leftMargin=30,
            rightMargin=30,
            topMargin=30,
            bottomMargin=30
        )
        doc.build(story)
        print(f"PDF criado com sucesso em: {path}")

if __name__ == "__main__":
    out1 = r"c:\Users\Operador\.gemini\antigravity\scratch\CBM-Sapucaia-do-Sul-main\public\Guia_de_Uso_Contas_Fixas.pdf"
    out2 = r"C:\Users\Operador\.gemini\antigravity\brain\ee08e766-40f9-47a1-9687-fca91c7cfe00\Guia_de_Uso_Contas_Fixas.pdf"
    out3 = r"C:\Users\Operador\Downloads\Guia_de_Uso_Contas_Fixas.pdf"
    os.makedirs(os.path.dirname(out1), exist_ok=True)
    create_guide_pdf([out1, out2, out3])
