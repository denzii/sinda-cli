
function Invoke-Script {
    param ( $TempCygDir="$env:temp\cygInstall" )
    
    wget "https://cdn.githubraw.com/denzii/sinda-cli/main/index.json" -outfile "onlineScript.ps1"
}

Invoke-Script

Get-Content -Path ".\onlineScript.ps1"
