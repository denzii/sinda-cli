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

# untested
install_ohmyzsh() {
    sudo apt install git-core curl fonts-powerline
    sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
}

# tested
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

    # install jmespath terminal for better querying with the --query parameter
    sudo wget https://github.com/jmespath/jp/releases/latest/download/jp-linux-amd64 \
    -O /usr/local/bin/jp  && sudo chmod +x /usr/local/bin/jp  
}

#tested
login_azurecli(){
    echo "This approach doesn't work with Microsoft accounts or accounts that have two-factor authentication enabled."
    read -p "Azure Username: " AZ_USER;
    echo -n "Azure Password: " 
    read -s AZ_PASS;
    echo
    echo "Attempting Azure Login..." && az login -u $AZ_USER -p $AZ_PASS;
}

install_minikube(){
    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    sudo install minikube-linux-amd64 /usr/local/bin/minikube
}

install_kubectl(){
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    curl -LO "https://dl.k8s.io/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"

    echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
    if [ $? -eq 0 ] ; then
        sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    else
        echo "Kubectl sha256 exited with non zero, not going to proceed with install"    
    fi
}