$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument '/c "C:\Users\jlema\.gemini\antigravity\scratch\contas_fixas_app\run_contas_fixas_notifier.bat"' -WorkingDirectory "C:\Users\jlema\.gemini\antigravity\scratch\contas_fixas_app"
$trigger = New-ScheduledTaskTrigger -Daily -At 08:00AM
Register-ScheduledTask -TaskName "Relatorio_Contas_Fixas_0800" -Action $action -Trigger $trigger -User "jlema" -Force
Write-Output "TAREFA CONTAS FIXAS REGISTRADA COM SUCESSO!"
