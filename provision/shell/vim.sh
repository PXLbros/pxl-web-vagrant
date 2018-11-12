#!/bin/bash

export EDITOR="vim";

if ! grep -qF "export EDITOR" /home/vagrant/.bashrc
then
    echo -e "\nexport EDITOR=$EDITOR" >> /home/vagrant/.bashrc
fi

# Save .vimrc
echo "set nocompatible
set autoread
set number
set ruler
set cmdheight=2
set ignorecase
set smartcase
set hlsearch
set lazyredraw
set showmatch
set mat=2
set smarttab
set shiftwidth=2
set tabstop=2
set laststatus=2
set expandtab
set backspace=indent,eol,start
set ttyfast
set mouse=a
set ttymouse=xterm2
set clipboard=unnamed
set wrap!

syntax enable

autocmd filetype crontab setlocal nobackup nowritebackup" > /home/vagrant/.vimrc
