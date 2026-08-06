import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, HRFlowable, PageBreak
)

def create_guide_pdf(output_paths):
    doc_styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=doc_styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#104E70'),
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        'DocH2',
        parent=doc_styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#104E70'),
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=doc_styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#0E2938'),
        spaceAfter=6
    )

    alert_style = ParagraphStyle(
        'DocAlert',
        parent=doc_styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0B334B'),
    )

    base_img_dir = r"C:\Users\Operador\.gemini\antigravity\brain\ee08e766-40f9-47a1-9687-fca91c7cfe00"

    story = []

    # Title
    story.append(Paragraph("Guia de Uso Oficial: Contas Fixas JLE Telecom", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#F3921F"), spaceAfter=12))

    story.append(Paragraph("Este guia apresenta o passo a passo completo, ilustrado e intuitivo para operar o sistema de <b>Contas Fixas Financeiro da JLE Telecom</b>.", body_style))
    story.append(Spacer(1, 8))

    # Section 1: Telegram
    story.append(Paragraph("1. Notificacao Automatica Diaria no Telegram", h2_style))
    
    telegram_box_text = Paragraph(
        "<b>Automacao Diaria as 08:00h</b><br/>"
        "Todos os dias, pontualmente as <b>08:00h da manha</b>, o sistema gera e envia automaticamente um relatorio de pagamentos no grupo oficial do Telegram: <b>Contas Fixas - Pagamentos</b>.<br/><br/>"
        "A mensagem detalha todas as contas fixas com vencimento no dia e disponibiliza o botao de acesso direto: <b>Calendario (Senha Jle@2026)</b>.<br/>"
        "Ao clicar no botao do Telegram, o sistema abre diretamente o painel web: <u>https://contasfixasjle.vercel.app</u>",
        alert_style
    )
    
    t_alert = Table([[telegram_box_text]], colWidths=[480])
    t_alert.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EBF5FA')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#104E70')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_alert)
    story.append(Spacer(1, 10))

    img_telegram = os.path.join(base_img_dir, "NOTIFICAÇÃO GRUPO.jpg")
    if os.path.exists(img_telegram):
        story.append(RLImage(img_telegram, width=460, height=220))
        story.append(Spacer(1, 12))

    # Section 2: Login
    story.append(Paragraph("2. Acesso e Autenticacao (Login)", h2_style))
    story.append(Paragraph("1. Acesse o endereco do sistema: <b>https://contasfixasjle.vercel.app</b>", body_style))
    story.append(Paragraph("2. Digite a senha padrao de acesso: <b>Jle@2026</b>", body_style))
    story.append(Paragraph("3. Clique em <b>Acessar Painel</b>.", body_style))
    story.append(Spacer(1, 6))

    img_login = os.path.join(base_img_dir, "TELA DE LOGIN.png")
    if os.path.exists(img_login):
        story.append(RLImage(img_login, width=460, height=240))
        story.append(Spacer(1, 12))

    story.append(PageBreak())

    # Section 3: Visao Geral
    story.append(Paragraph("3. Visao Geral do Calendario (Desktop e Mobile)", h2_style))
    story.append(Paragraph("• <b>Seletor de Mes (&lt; AGOSTO 2026 &gt;)</b>: Alterne facilmente entre os meses.", body_style))
    story.append(Paragraph("• <b>Botao 'Hoje'</b>: Retorna rapidamente para a data atual.", body_style))
    story.append(Paragraph("• <b>Botao '+ Nova Conta'</b>: Abre o formulario para lancar uma nova conta.", body_style))
    story.append(Paragraph("• <b>Lista de Contas por Dia</b>: Quando um dia possui muitas contas (ex: dia 10), a rolagem ocorre suavemente dentro do proprio card do dia.", body_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Visualizacao no Desktop:</b>", body_style))
    img_desk = os.path.join(base_img_dir, "TELA PRINCIPAL - CALENDÁRIO (DESKTOP).png")
    if os.path.exists(img_desk):
        story.append(RLImage(img_desk, width=460, height=230))
        story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Visualizacao no Mobile (Smartphones):</b>", body_style))
    img_mob = os.path.join(base_img_dir, "TELA PRINCIPAL - CALENDÁRIO (MOBILE).png")
    if os.path.exists(img_mob):
        story.append(RLImage(img_mob, width=300, height=350))
        story.append(Spacer(1, 12))

    story.append(PageBreak())

    # Section 4: Lançar Nova Conta
    story.append(Paragraph("4. Passo a Passo: Lancar uma Nova Conta Fixa", h2_style))
    story.append(Paragraph("1. No canto superior direito do cabecalho, clique no botao <b>+ Nova Conta</b>.", body_style))
    story.append(Paragraph("2. Preencha os dois campos do formulario:", body_style))
    story.append(Paragraph("   - <b>Dia do Vencimento (1 a 31)</b>: Digite o dia do mes (ex: 3).", body_style))
    story.append(Paragraph("   - <b>Descricao / Nome da Conta</b>: Digite o nome da despesa (ex: Aluguel Base NH).", body_style))
    story.append(Paragraph("3. Clique em <b>Salvar</b>.", body_style))
    story.append(Paragraph("4. O sistema exibira o modal de confirmacao: Clique em <b>Cadastrar</b> para confirmar a inclusao.", body_style))
    story.append(Spacer(1, 8))

    img_nova = os.path.join(base_img_dir, "FORMULÁRIO NOVA CONTA.png")
    if os.path.exists(img_nova):
        story.append(RLImage(img_nova, width=420, height=260))
        story.append(Spacer(1, 14))

    # Section 5: Editar / Excluir
    story.append(Paragraph("5. Passo a Passo: Editar ou Excluir uma Conta Existente", h2_style))
    story.append(Paragraph("1. Clique diretamente sobre a conta que deseja alterar no calendario (ex: Aluguel Base NH).", body_style))
    story.append(Paragraph("2. O formulario de edicao sera aberto com os campos preenchidos.", body_style))
    story.append(Spacer(1, 4))
    
    story.append(Paragraph("<b>Para Alterar:</b> Modifique o dia ou a descricao ➔ Clique em <b>Salvar</b> ➔ Confirme na caixa do sistema.", body_style))
    story.append(Paragraph("<b>Para Remover:</b> Clique no botao vermelho <b>Excluir</b> ➔ Confirme na caixa de seguranca (<b>Sim, Excluir</b>).", body_style))
    story.append(Spacer(1, 8))

    img_edit = os.path.join(base_img_dir, "EDITAR OU REMOVER CONTA EXISTENTE.png")
    if os.path.exists(img_edit):
        story.append(RLImage(img_edit, width=420, height=260))

    for path in output_paths:
        doc = SimpleDocTemplate(
            path,
            pagesize=A4,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        doc.build(story)
        print(f"PDF criado com sucesso em: {path}")

if __name__ == "__main__":
    out1 = r"c:\Users\Operador\.gemini\antigravity\scratch\CBM-Sapucaia-do-Sul-main\public\Guia_de_Uso_Contas_Fixas.pdf"
    out2 = r"C:\Users\Operador\.gemini\antigravity\brain\ee08e766-40f9-47a1-9687-fca91c7cfe00\Guia_de_Uso_Contas_Fixas.pdf"
    os.makedirs(os.path.dirname(out1), exist_ok=True)
    create_guide_pdf([out1, out2])
