Option Explicit

Dim shell, scriptPath, outputDirectory, command
Set shell = CreateObject("WScript.Shell")
scriptPath = WScript.Arguments(0)
outputDirectory = WScript.Arguments(1)
command = Chr(34) & "C:\Program Files\PowerShell\7\pwsh.exe" & Chr(34) _
  & " -NoProfile -NonInteractive -File " & Chr(34) & scriptPath & Chr(34) _
  & " -OutputDirectory " & Chr(34) & outputDirectory & Chr(34) & " -Once"
WScript.Quit shell.Run(command, 0, True)
