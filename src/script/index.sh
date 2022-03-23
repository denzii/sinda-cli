#!/bin/bash

# untested
install_zsh() {
    sudo apt-get update && sudo apt-get dist-upgrade -y
    sudo apt-get install build-essential curl file git
    sudo apt install zsh
    
    if zsh --version; then
    printf 'some_command succeeded\n'
    else
        sudo apt install zsh && sudo dpkg-reconfigure dash && sudo reboot 
    fi 

    chsh -s $(which zsh)
    grep zsh /etc/passwd
    echo 'Shell is now' 
    echo $SHELL
    whereis zsh
}

install_ohmyzsh() {
    sudo apt install git-core curl fonts-powerline
    sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
}

install_azurecli(){
    # commands put together from
    # https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-linux?pivots=apt

    # Get packages needed for install
    sudo apt-get update
    sudo apt-get install ca-certificates curl apt-transport-https lsb-release gnupg

    # Download and install the Microsoft signing key
    curl -sL https://packages.microsoft.com/keys/microsoft.asc |
        gpg --dearmor |
        sudo tee /etc/apt/trusted.gpg.d/microsoft.gpg > /dev/null

    # Add the Azure CLI software repository
    AZ_REPO=$(lsb_release -cs)
    echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" |
        sudo tee /etc/apt/sources.list.d/azure-cli.list

    # Update repository information and install the azure-cli package
    sudo apt-get update
    sudo apt-get install azure-cli
}