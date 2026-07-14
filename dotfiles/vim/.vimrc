" Tanaab Vim
" A self-contained, terminal-native profile that inherits its palette from Warp.

if &compatible
  set nocompatible
endif

let mapleader = ','
let maplocalleader = ','

filetype plugin indent on
syntax enable

" Use Vim's maintained optional packages instead of a third-party plugin manager.
packadd comment
packadd editorconfig
packadd matchit
packadd nohlsearch

" General editing behavior.
set autoread
set autowrite
set backspace=indent,eol,start
set hidden
set history=1000
set nojoinspaces
set nrformats-=octal
set shortmess+=I
set showcmd
set noshowmode
set updatetime=300
set timeoutlen=500

" Search and command completion.
set hlsearch
set ignorecase
set incsearch
set smartcase
set path+=**
set wildmenu
set wildmode=longest:full,full
set wildoptions=pum,fuzzy
set wildignore+=*/.git/*,*/node_modules/*,*/vendor/*,*/dist/*

" Layout and navigation.
set number
set cursorline
set scrolloff=3
set sidescrolloff=5
set signcolumn=yes
set splitbelow
set splitright
set laststatus=2

" Two-space soft tabs remain the default; filetype plugins and EditorConfig may override them.
set expandtab
set shiftround
set shiftwidth=2
set softtabstop=2
set tabstop=2

" Make whitespace and the preferred line length visible without forcing hard wrapping.
set list
set listchars=tab:»·,trail:·,nbsp:·
set wrap
set linebreak
set breakindent
set textwidth=0
set wrapmargin=0
set colorcolumn=80

" Keep recovery data out of project directories.
let s:state_root = empty($XDG_STATE_HOME)
      \ ? expand('~/.local/state/vim')
      \ : expand($XDG_STATE_HOME . '/vim')
let s:backup_dir = s:state_root . '/backup'
let s:swap_dir = s:state_root . '/swap'
let s:undo_dir = s:state_root . '/undo'

for s:state_dir in [s:backup_dir, s:swap_dir, s:undo_dir]
  if !isdirectory(s:state_dir)
    call mkdir(s:state_dir, 'p', 0700)
  endif
endfor

let &backupdir = s:backup_dir . '//'
let &directory = s:swap_dir . '//'
let &undodir = s:undo_dir . '//'
set backup
set swapfile
set undofile
set writebackup

" Netrw is the built-in file browser.
let g:netrw_banner = 0
let g:netrw_browse_split = 0
let g:netrw_liststyle = 3
let g:netrw_winsize = 30
let g:netrw_altv = 1
let g:netrw_list_hide = '\.git/$'

" The Tanaab colorscheme uses ANSI indexes so Warp remains the RGB source of truth.
set notermguicolors
colorscheme tanaab

let &statusline = '%#TanaabStatusGreen# tanaab %#StatusLine# %f %m%r%h%w%=%#TanaabStatusPink# %y %#StatusLine# %l:%c %p%% '

" File, buffer, and window navigation.
nnoremap <silent> <leader>n :Lexplore<CR>
nnoremap <leader>f :find<Space>
nnoremap <leader>b :buffer<Space>
nnoremap <silent> [b :bprevious<CR>
nnoremap <silent> ]b :bnext<CR>
nnoremap <silent> <C-h> <C-w>h
nnoremap <silent> <C-j> <C-w>j
nnoremap <silent> <C-k> <C-w>k
nnoremap <silent> <C-l> <C-w>l

" Common profile actions.
nnoremap <silent> <leader>w :write<CR>
nnoremap <silent> <leader>q :quit<CR>
nnoremap <silent> <leader>/ :nohlsearch<CR>
nnoremap <silent> <leader>e :edit $MYVIMRC<CR>
nnoremap <silent> <leader>r :source $MYVIMRC<CR>
