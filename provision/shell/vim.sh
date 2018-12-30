#!/bin/bash

export LOG_FILE_PATH=shell/vim.log

. /vagrant/provision/helpers/include.sh

title "Vim"

export EDITOR='vim';

if ! grep -qF "export EDITOR" $HOME/.bashrc
then
    highlight_text 'Set Vim as default editor...'

    exec_command "echo -e \"\nexport EDITOR=$EDITOR\" >> $HOME/.bashrc"
fi

# Set .vimrc
highlight_text 'Set Vim preferences...'

exec_command "echo -e \"set history=500
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

set statusline+=File:\\ %f
set statusline+=\\ \\ \\~\\ \\ \\n
set statusline+=Line:\\ %l\\ (%p%%)

:set mouse=a\" > $HOME/.vimrc"

BASH_PROFILE_PATH=$HOME/.bash_profile

if [ ! -f $BASH_PROFILE_PATH ]; then
    if ! grep -qF "# Vim" $BASH_PROFILE_PATH
    then
        exec_command "echo -e \"\n# Vim
    alias edit_vimrc='vim ~/.vimrc'\" >> $HOME/.bash_profile"
    fi
fi
