#!/bin/bash

export LOG_FILE_PATH=/vagrant/logs/shell/vim.log

. /vagrant/provision/helpers.sh

title "Vim"

export EDITOR='vim';

if ! grep -qF "export EDITOR" $HOME/.bashrc
then
    info_text 'Set Vim as default editor...'

    debug_command "echo -e \"\nexport EDITOR=$EDITOR\" >> $HOME/.bashrc"
fi

# Set .vimrc
info_text 'Set Vim preferences...'

debug_command "echo -e \"set history=500
filetype plugin on
filetype indent on
set autoread
set ruler
set cmdheight=2
set hid
set backspace=eol,start,indent
set whichwrap+=<,>,h,l
set ignorecase
set smartcase
set hlsearch
set incsearch
set lazyredraw
set showmatch
set mat=2
set noerrorbells
set novisualbell
set t_vb=
set tm=500

syntax enable

set background=dark
set encoding=utf8
set ffs=unix,dos,mac
set nobackup
set nowb
set noswapfile
set expandtab
set smarttab
set shiftwidth=4
set tabstop=4
set ai
set si
set laststatus=2

set statusline=Dir:\\ %r%{getcwd()}%h
set statusline+=\\ \\ \\~\\ \\ \\n
set statusline+=File:\\ %f
set statusline+=\\ \\ \\~\\ \\ \\n
set statusline+=Line:\\ %l\\ (%p%%)

:set mouse=a\" > $HOME/.vimrc"

if ! grep -qF "# Vim" $HOME/.bash_profile
then
    echo -e "\n# Vim
alias edit_vimrc='vim ~/.vimrc'" >> $HOME/.bash_profile
fi
