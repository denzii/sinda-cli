function Test-Elevation {
    [OutputType([boolean])]
    $elevated = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

    return $elevated
}


function Get-EnvState {
    if(!(Test-Elevation)){
    	throw "This requires admin privileges! Please run it through an elevated powershell prompt."
    }

    return @{
        osArchitectureBits= ($env:PROCESSOR_ARCHITECTURE -split '(?=\d)',2)[1];
        osArchitecture= ($env:PROCESSOR_ARCHITECTURE -split '(?=\d)',2)[0];
        osBuild= [int]((wmic os get BuildNumber) -split '(?=\d)',2)[3];
        osVersion = [int](Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").ReleaseId;
        isWslEnabled = Test-WSL;
        isVirtualMachineEnabled = ((Get-WindowsOptionalFeature -Online | Where-Object FeatureName -eq VirtualMachinePlatform).State) -eq "Enabled";
        defaultWslVersion = Get-ItemPropertyValue -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss -Name DefaultVersion;
        supportsWSL2 = Test-WSL2Support;
        distroState = Get-DistroState;
        addonState = Get-AddonState;
    } | ConvertTo-Json
}

function Get-DistroState {
    if(Test-WSL) {
		# Temporarily set console output encoding to unicode to read the wsl --list results properly
		[Console]::OutputEncoding = [Text.Encoding]::Unicode

		# Split by \r*\n to work around the issue of "D  E  B  I  A  N"
        ($cmdOut = wsl --list) > $null
        $wslListOutput =  $cmdOut -split "\r*\n"

        $distroState = @{}
        $installedDistros = New-Object System.Collections.ArrayList
		foreach ($line in $wslListOutput) {
  			$lineIsEmpty = ("" -eq $line) -or ([string]::IsNullOrWhiteSpace($line))
  			$lineIsBullshit = $line -eq "Windows Subsystem for Linux Distributions:"

			$noInstalledDistrosMessage = "Windows Subsystem for Linux has no installed distributions."
			$noDistroIsPresent = $line -eq $noInstalledDistrosMessage

			if ($noDistroIsPresent) { break }
  			if ($lineIsEmpty -or $lineIsBullshit) { continue }

            if ($line -Match "(([a-zA-Z]*) ([(Default)])*)"){
     			$distroName = ($line -split ' ',2)[0]
				$distroState.defaultDistro =  ($line -split ' ',2)[0]
  			} else {
                $installedDistros.Add(($line -split ' ',2)[0]) > $null
  			}
		}

        $distroState.installedDistros = $installedDistros
        # set back to utf8 so the terminal won't get messed up
		[Console]::OutputEncoding = [Text.Encoding]::UTF8

        return $distroState
	}
}

#############################################################################################################################################
# Get Environment Variables For Initial System State Pertaining to Windows Terminal & terminal polyfills
function Get-AddonState {
    if(!(Test-Elevation)){
    	throw "This requires admin privileges!"
    }

    return @{
        isChocoInstalled= Test-Chocolatey;
        isWindowsTerminalInstalled= Test-WindowsTerminal;
        isOhMyPoshInstalled= Test-OhMyPosh;
        isPoshGitInstalled = Test-PoshGit;
        isCascadiaCodeInstalled = Test-WSL;
        hasGlyphs = Test-Glyphs;
    }
}

#############################################################################################################################################
function Test-WindowsTerminal {
    [OutputType([boolean])]

    $windowsTerminalCommandOutput = [string](Get-Command -Name wt.exe -ErrorAction SilentlyContinue)
    $isWindowsTerminalInstalled = !([string]::IsNullOrEmpty($windowsTerminalCommandOutput))

    return $isWindowsTerminalInstalled
}

function Enable-WindowsTerminal {
    if(!(Test-Elevation)){
    	throw "This requires admin privileges, please run it through an elevated powershell prompt"
     }
     if (!(Test-Chocolatey)){
     	# throw "This requires chocolatey, please run Enable-Chocolatey function first"
         Enable-Chocolatey
     }

     Write-Host "Installing Microsoft Terminal through Chocolatey" -ForegroundColor White -BackgroundColor Black
     $result = choco install microsoft-windows-terminal -y --pre

	 if($?){
		Write-Host "Win Term Successfully installed"
	} else{
		Write-Error $result
	}

     #TODO: Move settings backup to a separate function so it can be executed after wsl setup
     #$wtSettingsURL = "https://raw.githubusercontent.com/denzii/sindagal/master/settings.json"

     #Write-Host "Replacing Windows Terminal settings with pre-configured settings downloaded from github" -ForegroundColor White -BackgroundColor Black
     #Write-Host "${wtSettingsURL}"  -ForegroundColor White -BackgroundColor Black

    #$windowsTerminalConfigPath = "$env:USERPROFILE\AppData\Local\Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings.json"
    #$windowsTerminalBackupConfigPath = "$env:USERPROFILE\AppData\Local\Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings-backup.json"

    #if (!(Test-Path -Path $windowsTerminalBackupConfigPath -PathType Leaf)){
	#Write-Host "Backing up windows terminal settings" -ForegroundColor White -BackgroundColor Black
        #Rename-Item -LiteralPath $windowsTerminalConfigPath -NewName "settings-backup.json"
    #}

    #Invoke-WebRequest -uri  "https://raw.githubusercontent.com/denzii/sindagal/master/settings.json" -Method "GET" -Outfile $windowsTerminalConfigPath
}


function Disable-WindowsTerminal {
    if(!(Test-Elevation)){
    	throw "This requires admin privileges, please run it through an elevated powershell prompt"
     }

     if (Test-WindowsTerminal) {
     if (!(Test-Chocolatey)) {
     	Enable-Chocolatey
     }
     Write-Host "Removing Microsoft Windows Terminal Executable through Chocolatey" -ForegroundColor White -BackgroundColor Black

     choco uninstall microsoft-windows-terminal -y --pre --force

     # remove leftover appx package manually (for some reason choco is not reliably removing it)
     $windowsTerminalFullName = (Get-AppxPackage | Where-Object Name -eq "Microsoft.WindowsTerminalPreview").PackageFullName
     Remove-AppxPackage -Package $windowsTerminalFullName
     }
}

function Restore-WindowsTerminal {
    if(!(Test-Elevation)){
    	throw "This requires admin privileges, please run it through an elevated powershell prompt"
     }
    Write-Host "Restoring Microsoft Windows Terminal to its initial state" -ForegroundColor White -BackgroundColor Black

    $windowsTerminalConfigPath = "$env:USERPROFILE\AppData\Local\Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings.json"
    $windowsTerminalBackupConfigPath = "$env:USERPROFILE\AppData\Local\Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings-backup.json"

    Remove-Item $windowsTerminalConfigPath;Rename-Item -Path $windowsTerminalBackupConfigPath -NewName "settings.json"
}

#############################################################################################################################################

function Test-Chocolatey {
    [OutputType([boolean])]

    $chocoCommandOutput = [string](Get-Command -Name choco.exe -ErrorAction SilentlyContinue)
    $isChocoInstalled = !([string]::IsNullOrEmpty($chocoCommandOutput))

    return $isChocoInstalled
}

function Enable-Chocolatey {
    $InstallDir='C:\ProgramData\chocoportable'
    $env:ChocolateyInstall="$InstallDir"

    Set-ExecutionPolicy Bypass -Scope Process -Force;
    Write-Host "Installing Chocolatey using official script @ https://community.chocolatey.org/install.ps1" -ForegroundColor White -BackgroundColor Black

    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

   if (!(Test-Chocolatey)) {
       Write-Host "For some reason chocolatey was not installed " -ForegroundColor Red -BackgroundColor Black
       Write-Host "Bye~~" -ForegroundColor Red -BackgroundColor Black
   }

   choco upgrade chocolatey -y
}

function Disable-Chocolatey {
    if(!(Test-Elevation)){
    	throw "This requires admin privileges, please run it through an elevated powershell prompt"
     }

    if(Test-Chocolatey){
     Write-Host "Uninstalling Chocolatey" -ForegroundColor White -BackgroundColor Black
     $InstallDir='C:\ProgramData\chocoportable'

     Get-ChildItem -Path $InstallDir -Recurse | Remove-Item -force -recurse
     Remove-Item $InstallDir -Recurse -Force

     $env:ChocolateyInstall=$null
    }
}

#############################################################################################################################################

function Enable-OhMyPosh {
    if(!(Test-OhMyPosh)){
        Install-Module oh-my-posh -Scope CurrentUser
		if (!Test-Glyphs){
			Add-Glyphs
		}
    }
	if ($?){
		Write-Host("Oh My posh & nerd fonts have been installed")

	} else{
		Write-Error("Something went wrong, please execute script manually and check or report issue");
	}
}

function Test-OhMyPosh {
    [OutputType([boolean])]

    $ohMyPoshCommandOutput = [string](Get-Module -ListAvailable -Name oh-my-posh)
    $isOhMyPoshInstalled =  !([string]::IsNullOrEmpty($ohMyPoshCommandOutput))

    return $isOhMyPoshInstalled
}

# function Enable-OhMyPosh {
#     if(!(Test-Elevation)){
#     	throw "This requires admin privileges, please run it through an elevated powershell prompt"
#      }
#      Write-Host "Installing Oh my posh powershell module through PowerShellGet" -ForegroundColor White -BackgroundColor Black
#      ECHO Y | powershell Install-Module oh-my-posh -Force -Scope CurrentUser
# }

function Disable-OhMyPosh {
    if(Test-OhMyPosh){
    	Write-Host "Removing Oh my posh powershell module through PowerShellGet" -ForegroundColor White -BackgroundColor Black
    	Get-InstalledModule -Name oh-my-posh | Uninstall-Module
    }
}

#############################################################################################################################################

function Test-PoshGit {
    [OutputType([boolean])]

    $poshGitCommandOutput = [string](Get-Module -ListAvailable -Name posh-git)
    $isPoshGitInstalled =  !([string]::IsNullOrEmpty($poshGitCommandOutput))

    return $isPoshGitInstalled
}

function Enable-PoshGit {
    Write-Host "Installing posh git powershell module through PowerShellGet" -ForegroundColor White -BackgroundColor Black
     ECHO Y | powershell Install-Module posh-git -Force -Scope CurrentUser

	 if($?){
		Write-Host "Posh git Successfully installed"
	} else{
		Write-Error "Something went wrong, please report it or debug script manually"
	}
}

function Disable-PoshGit {
    if(!(Test-Elevation)){
    	throw "This requires admin privileges, please run it through an elevated powershell prompt"
     }
    if (Test-PoshGit){
    	Write-Host "Removing posh git powershell module through PowerShellGet" -ForegroundColor White -BackgroundColor Black
    	Get-InstalledModule -Name posh-git | Uninstall-Module
    }
}

#############################################################################################################################################

function Test-Glyphs{
    # For some reason return type annotation does not work if importing library?
    [System.Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null
    $fontQueryOutput = ([string]((New-Object System.Drawing.Text.InstalledFontCollection).Families | Where-Object Name -eq "CascadiaCode Nerd Font"))
    $isCascadiaCodeInstalled = (![string]::IsNullOrEmpty($fontQueryOutput))

    return $isCascadiaCodeInstalled
}

function Add-Glyphs {
    if(!(Test-Elevation)){
    	throw "This requires admin privileges, please run it through an elevated powershell prompt"
    }

    	$cascadiaCodeURL = "https://github.com/AaronFriel/nerd-fonts/releases/download/v1.2.0/CascadiaCode.Nerd.Font.Complete.ttf"

	$cascadiaDestinationPath = "C:\ProgramData\Sindagal\cascadia-code"
	If(!(test-path $cascadiaDestinationPath)){
       	    New-Item -Path $cascadiaDestinationPath -ItemType "directory"
	}

	Write-Host "Downloading Cascadia Code NF Patch from" -ForegroundColor White -BackgroundColor Black
	Write-Host "${cascadiaCodeURL}\"  -ForegroundColor White -BackgroundColor Black

	if(!(test-path "${cascadiaDestinationPath}\CascadiaCode.Nerd.Font.Complete.ttf")){
		Invoke-WebRequest -uri $cascadiaCodeURL -Method "GET" -Outfile "${cascadiaDestinationPath}\CascadiaCode.Nerd.Font.Complete.ttf"
	}

	Write-Host "Iterating over ${cascadiaDestinationPath} folder contents to save each font on the Host" -ForegroundColor White -BackgroundColor Black
        $files = Get-ChildItem "${cascadiaDestinationPath}"

        foreach ($f in $files){
            $FontFile = [System.IO.FileInfo]$f
            Install-Font -FontFile $FontFile
        }

	Write-Host "Restarting Powershell session for changes to take effect..." -ForegroundColor White -BackgroundColor Black
	Get-Process -Id $PID | Select-Object -ExpandProperty Path | ForEach-Object { Invoke-Command { & "$_" } -NoNewScope }
}

function Remove-Glyphs {
    if(!(Test-Elevation)){
    	throw "This requires admin privileges, please run it through an elevated powershell prompt"
    }
    if(Test-Glyphs){
	$cascadiaDestinationPath = "C:\ProgramData\Sindagal\cascadia-code"
        Write-Host "Iterating over ${cascadiaDestinationPath} folder contents to delete each font from the Host" -ForegroundColor White -BackgroundColor Black
        $files = Get-ChildItem "${cascadiaDestinationPath}"

        foreach ($f in $files){
            $FontFile = [System.IO.FileInfo]$f
            Remove-Font -FontFile $FontFile
        }
	Write-Host "Restarting Powershell session for changes to take effect..." -ForegroundColor White -BackgroundColor Black
	Get-Process -Id $PID | Select-Object -ExpandProperty Path | ForEach-Object { Invoke-Command { & "$_" } -NoNewScope }
    }
}
#############################################################################################################################################


function Test-WSL2Support {
    [OutputType([boolean], [System.Void])]

    $amdRequiredOsVersion = [int]1903
    $amdRequiredOsBuild = [int]18362

    $armRequiredOsVersion = [int]2004
    $armRequiredOsBuild = [int]19041

    $amdWsl2EligibilityCriteria = $env:SINDAGAL_OS_VER -ge $amdRequiredOsVersion -and $env:SINDAGAL_OS_BUILD -ge $amdRequiredOsBuild
    $armWsl2EligibilityCriteria = $env:SINDAGAL_OS_VER -ge $armRequiredOsVersion -and $env:SINDAGAL_OS_BUILD -ge $armRequiredOsBuild

    $isAmd = $env:SINDAGAL_OS_ARCHITECTURE -eq "AMD"
    $isArm = $env:SINDAGAL_OS_ARCHITECTURE -eq "ARM"
    $is64Bits = $env:SINDAGAL_OS_BITS -eq "64"

    $osIsWsl2Eligible = If($isAmd){ $amdWsl2EligibilityCriteria } ElseIf($isArm){$armWsl2EligibilityCriteria} Else {[bool]$false}
    $hostSupportsWsl2 = $is64Bits -and $osIsWsl2Eligible

    return $hostSupportsWsl2
}

function Test-WSL {
     #below does not work because system32 always has wsl.exe after first installation no matter what
    #$wslCommandOutput = [string](Get-Command -Name wsl.exe -ErrorAction SilentlyContinue)
    #$isWslInstalled = !([string]::IsNullOrEmpty($wslCommandOutput))
    #return $isWslInstalled

    return (Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux).State -eq "Enabled"
}

function Enable-WSL {
    try {
		ECHO N | powershell Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -All
		ECHO N | powershell Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -All
		Write-Host "A restart is required after enabling wsl for the first time."
    } catch {
        Write-Host "wsl not supported on this machine, is it a toaster?"
    }
    try{
        wsl.exe --set-version Ubuntu 2
         wsl.exe --set-default-version 2
    } catch {
        Write-Host "WSL2 not supported on host"
    }
}

function Enable-WSLLegacy {
    # if(!(Test-Elevation)){
    # 	throw "This requires admin privileges, please run it through an elevated powershell prompt"
    # }
    # if(!($env:SINDAGAL_CONFIGURED)){
    #     throw "This requires setting the env, please run Set-EnvState first"
    # }
    if(!(Test-WSL)){
    	try {
			Write-Host "Enabling WSL..." -ForegroundColor White -BackgroundColor Black
      	    ECHO N | powershell Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -All

        	if (Test-WSL2Support){
	    		Write-Host "Host Supports WSL2..." -ForegroundColor White -BackgroundColor Black
	   			Write-Host "Enabling Virtual Machine Platform..." -ForegroundColor White -BackgroundColor Black
            	ECHO N | powershell Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -All

                $installFolder = "C:\ProgramData\Sindagal\"
                $installFile = "C:\ProgramData\Sindagal\wsl_update_x64.msi"

		If(!(test-path $installFolder)){
       	    		New-Item -Path $installFolder -ItemType "directory"
		}
	    		Write-Host "Downloading WSL2 Kernel Update from official source: https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi" -ForegroundColor White -BackgroundColor Black
            	Invoke-WebRequest -uri https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi -Method "GET"  -OutFile $installFile

            	# silent install
	    		Write-Host "Silently running the WSL2 Kernel Update" -ForegroundColor White -BackgroundColor Black
            	$installerParams = @("/qn", "/i", $installFile);Start-Process "msiexec.exe" -ArgumentList $installerParams -Wait -NoNewWindow
        	}
    	Get-Process -Id $PID | Select-Object -ExpandProperty Path | ForEach-Object { Invoke-Command { & "$_" } -NoNewScope }
    	Write-Host "WSL has been enabled, please restart for the changes to take effect..." -ForegroundColor White -BackgroundColor Black
    	}
    	catch {
        	Write-Host 'Failed' -ForegroundColor Red
        	write-warning $_.exception.message
    	}
    }
}

function Enable-Docker{
	if (!(Test-Chocolatey)){
		Enable-Chocolatey
	}

	choco install -y docker-desktop --force
}

function Enable-Podman{
	if (!(Test-Chocolatey)){
		Enable-Chocolatey
	}

	choco install -y podman-cli --pre --force
}

function Enable-Dotnet{
	if (!(Test-Chocolatey)){
		Enable-Chocolatey
	}

	choco install -y dotnet-7.0-runtime --pre --force
	choco install -y dotnet-7.0-sdk --pre --force
	Write-Host "This requires a restart"
}

function Add-SindaDistro{
# return
	$distroState = Get-DistroState

	if((Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -All).RestartNeeded){
		Write-Error "Pending restart after enabling WSL, cannot import a new distro"
		return
	}
	if ((Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -All).RestartNeeded){
		Write-Error "Pending restart after enabling WSL, cannot import a new distro"
		return
	}

	if([bool]$distroState["installedDistros"].Contains("SindaUbuntu")){
		Write-Host "distro already exists, no action taken"
		return
	}else {
		$confDir="C:\ProgramData\sindagal\"
		$artifactPath = "C:\ProgramData\sindagal\sinda-ubuntu.tar"
		if (!(Test-Path $artifactPath)){
			Invoke-WebRequest -Uri "https://storage.googleapis.com/dnzartif/sinda-ubuntu.tar" -OutFile $artifactPath
		}
		wsl.exe --import SindaUbuntu $confDir $artifactPath
	}

	$distroState = Get-DistroState
	if([bool]$distroState["installedDistros"].Contains("SindaUbuntu")){
		Write-Host "Distros updated without errors..."
	} else{
		Write-Error "An error occured, distros remain unchanged"
	}
}
function Add-SindaModule{
	$userPsModulesDir = ($env:PsModulePath -split '(?=[;])',5)[0]
	$singadalModuleDir = "$userPsModulesDir\Sindagal"
	if(!(test-path $singadalModuleDir))
	{
		New-Item -Path $singadalModuleDir -ItemType Directory
	}

	Copy-Item -Path ".\src\script\Sindagal.psm1" -Destination $singadalModuleDir
	Import-Module -Global -Name Sindagal

	if((!$?)){
		Write-Error "Something went wrong and the powershell module haven't been imported."
		return
	}
	if(!(Get-Module -ListAvailable | Where-Object Name -eq "Sindagal")){
		Write-Error "Something went wrong and the powershell module haven't been imported."
		return
	} else{
		Write-Host "Sindagal PowerShell Dev module had been imported. Now you an now execute the PS automations directly using their function names."
	}
}

function Get-BoilerplatePortfolio {
	Set-Location ..\
	$folder = Get-ChildItem "sindagal-portfolio-template" -Directory -ErrorAction SilentlyContinue

	if(!($folder)){
		git clone https://github.com/denzii/sindagal-portfolio-template.git
	} else{
		Write-Host("Portfolio already exist at location: ../")
		return
	}

	if($?){
		Write-Host("Portfolio boilerplate successfully cloned to the dir at location: ../")
		return
	}
	Write-Error("Something went wrong, boilerplate hasn't been downloaded")
}

function Disable-WSL {
    if(!(Test-Elevation)){
    	throw "This requires admin privileges, please run it through an elevated powershell prompt"
    }
    if(Test-WSL){
        try {
            Write-Host "Disabling WSL..." -ForegroundColor White -BackgroundColor Black
             ECHO N | powershell Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux

            if (Test-WSL2Support){
    		Write-Host "Disabling Virtual Machine Platform..." -ForegroundColor White -BackgroundColor Black
		 ECHO N | powershell Disable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform

                $installFolder = "C:\ProgramData\Sindagal\"
                $installFile = "C:\ProgramData\Sindagal\wsl_update_x64.msi"

                # silent uninstall
		Write-Host "Downgrading from WSL2 Kernel Patch..." -ForegroundColor White -BackgroundColor Black
                $installerParams = @("/qn", "/x", $installFile)
                Start-Process "msiexec.exe" -ArgumentList $installerParams -Wait -NoNewWindow
            }
        }
        catch {
            Write-Host 'Failed' -ForegroundColor Red
            write-warning $_.exception.message
        }
    	Get-Process -Id $PID | Select-Object -ExpandProperty Path | ForEach-Object { Invoke-Command { & "$_" } -NoNewScope }
    	Write-Host "WSL has been disabled, please restart for the changes to take effect..." -ForegroundColor White -BackgroundColor Black
    }
}

function New-Distro {
    if(!(Test-Elevation)){
    	throw "This requires admin privileges, please run it through an elevated powershell prompt"
    }
    Invoke-WebRequest -Uri https://aka.ms/wsl-debian-gnulinux -OutFile .\Debian.appx -UseBasicParsing
    Add-AppxPackage .\Debian.appx
}

function Remove-Distro {
    if(!(Test-Elevation)){
    	throw "This requires admin privileges, please run it through an elevated powershell prompt"
    }
    wsl.exe --unregister Debian
    Remove-AppxPackage .\Debian.appx
}



#############################################################################################################################################

#region Internal Functions

# Install-Font Function Author: Mick Pletcher
# Published: Tuesday, June 29, 2021
# Source: https://mickitblog.blogspot.com/2021/06/powershell-install-fonts.html
function Install-Font {
    param
    (
         [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][System.IO.FileInfo]$FontFile
    )

    if(!(Test-Elevation)){
    	throw "This requires admin privileges, please run it through an elevated powershell prompt"
    }

    #Get Font Name from the File's Extended Attributes
    $oShell = new-object -com shell.application
    $Folder = $oShell.namespace($FontFile.DirectoryName)
    $Item = $Folder.Items().Item($FontFile.Name)
    $FontName = $Folder.GetDetailsOf($Item, 21)
    try {
        switch ($FontFile.Extension) {
            ".ttf" {$FontName = $FontName + [char]32 + '(TrueType)'}
            ".otf" {$FontName = $FontName + [char]32 + '(OpenType)'}
        }
        $Copy = $true
        Write-Host ('Copying' + $FontFile.Name + '.....') -NoNewline
        Copy-Item -Path $fontFile.FullName -Destination ("C:\Windows\Fonts\" + $FontFile.Name) -Force
        #Test if font is copied over
        If ((Test-Path("C:\Windows\Fonts\" + $FontFile.Name)) -eq $true) {
             Write-Host 'Success' -Foreground Yellow
        } else {
             Write-Host 'Failed' -ForegroundColor Red
        }
        $Copy = $false
        #Test if font registry entry exists
        If ($null -ne (Get-ItemProperty -Name $FontName -Path "HKLM:\Software\Microsoft\Windows NT\CurrentVersion\Fonts" -ErrorAction SilentlyContinue)) {
             #Test if the entry matches the font file name
            If ((Get-ItemPropertyValue -Name $FontName -Path "HKLM:\Software\Microsoft\Windows NT\CurrentVersion\Fonts") -eq $FontFile.Name) {
                Write-Host 'Adding' +  $FontName + 'to the registry.....' -NoNewline  -ForegroundColor White
                Write-Host 'Success' -ForegroundColor Yellow
            } else {
                $AddKey = $true
                Remove-ItemProperty -Name $FontName -Path "HKLM:\Software\Microsoft\Windows NT\CurrentVersion\Fonts" -Force
                Write-Host 'Adding' + $FontName + 'to the registry.....' -NoNewline  -ForegroundColor White
                New-ItemProperty -Name $FontName -Path "HKLM:\Software\Microsoft\Windows NT\CurrentVersion\Fonts" -PropertyType string -Value $FontFile.Name -Force -ErrorAction SilentlyContinue | Out-Null

                If ((Get-ItemPropertyValue -Name $FontName -Path "HKLM:\Software\Microsoft\Windows NT\CurrentVersion\Fonts") -eq $FontFile.Name) {
                    Write-Host 'Success' -ForegroundColor Yellow
                 } else {
                    Write-Host 'Failed' -ForegroundColor Red
                 }
             $AddKey = $false
            }
        } else {
            $AddKey = $true
            Write-Host 'Adding' + $FontName + 'to the registry.....' -NoNewline  -ForegroundColor White
            New-ItemProperty -Name $FontName -Path "HKLM:\Software\Microsoft\Windows NT\CurrentVersion\Fonts" -PropertyType string -Value $FontFile.Name -Force -ErrorAction SilentlyContinue | Out-Null
            If ((Get-ItemPropertyValue -Name $FontName -Path "HKLM:\Software\Microsoft\Windows NT\CurrentVersion\Fonts") -eq $FontFile.Name) {
                Write-Host 'Success' -ForegroundColor Yellow
            } else {
                Write-Host 'Failed' -ForegroundColor Red
            }
            $AddKey = $false
        }
    } catch {
        If ($Copy -eq $true) {
            Write-Host 'Failed' -ForegroundColor Red
            $Copy = $false
        }
        If ($AddKey -eq $true) {
            Write-Host 'Failed' -ForegroundColor Red
            $AddKey = $false
        }
        write-warning $_.exception.message
    }
}

function Remove-Font {
    param
    (
         [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][System.IO.FileInfo]$FontFile
    )

    if(!(Test-Elevation)){
    	throw "This requires admin privileges, please run it through an elevated powershell prompt"
    }

     #Get Font Name from the File's Extended Attributes
     $oShell = new-object -com shell.application
     $Folder = $oShell.namespace($FontFile.DirectoryName)
     $Item = $Folder.Items().Item($FontFile.Name)
     $FontName = $Folder.GetDetailsOf($Item, 21)
     try {
        switch ($FontFile.Extension) {
            ".ttf" { $FontName = $FontName + [char]32 + '(TrueType)' }
            ".otf" { $FontName = $FontName + [char]32 + '(OpenType)' }
        }
 	$fontRegistryKeyExists = $null -ne (Get-ItemProperty -Name $FontName -Path "HKLM:\Software\Microsoft\Windows NT\CurrentVersion\Fonts" -ErrorAction SilentlyContinue)
         If ($fontRegistryKeyExists) {
            Write-Host ('Removing key for ' + $FontName + ' from the registry.....') -NoNewline  -ForegroundColor White
            Remove-ItemProperty -Name $FontName -Path "HKLM:\Software\Microsoft\Windows NT\CurrentVersion\Fonts" -Force
         }

        Write-Host ('Deleting' + $FontFile.Name + '.....') -NoNewline
        Remove-Item ("C:\Windows\Fonts\" + $FontFile.Name) -Force

        $fontIsDeleted = (Test-Path ("C:\Windows\Fonts\" + $FontFile.Name)) -eq $false
        If ($fontIsDeleted) { Write-Host ('Success') -Foreground Yellow }
        else {  Write-Host ('Failed') -ForegroundColor Red }

     } catch {
        Write-Host ('Failed') -ForegroundColor Red
        write-warning $_.exception.message
     }
}
#endregion Internal Functions
