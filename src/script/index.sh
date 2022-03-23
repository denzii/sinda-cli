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