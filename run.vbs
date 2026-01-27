Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "taskkill /F /IM node.exe", 0, True
WshShell.Run "cmd /c npm run dev", 0, False
WshShell.Run "chrome.exe http://localhost:5173/"
Set WshShell = Nothing