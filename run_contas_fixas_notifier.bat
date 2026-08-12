@echo off
cd /d "C:\Users\jlema\.gemini\antigravity\scratch\contas_fixas_app"
python telegram_cloud_notifier.py >> contas_fixas_notifier.log 2>&1
