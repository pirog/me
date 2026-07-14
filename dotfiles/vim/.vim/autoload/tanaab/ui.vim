function! s:center(text, width) abort
  let l:remaining = max([0, a:width - strdisplaywidth(a:text)])
  let l:left = l:remaining / 2
  return repeat(' ', l:left) . a:text . repeat(' ', l:remaining - l:left)
endfunction

function! s:box_line(margin, text, width) abort
  return a:margin . '│' . s:center(a:text, a:width) . '│'
endfunction

function! s:pad(text, width) abort
  return a:text . repeat(' ', max([0, a:width - strdisplaywidth(a:text)]))
endfunction

function! s:status(label, ready) abort
  return (a:ready ? '● ' : '○ ') . a:label
endfunction

function! tanaab#ui#welcome(force) abort
  if a:force
    enew
  elseif argc() > 0 || line('$') != 1 || getline(1) !=# '' || !empty(bufname())
    return
  endif

  let l:version = printf('%d.%d', v:version / 100, v:version % 100)
  let l:box_width = 62
  let l:margin_width = max([2, (winwidth(0) - l:box_width - 2) / 2])
  let l:margin = repeat(' ', l:margin_width)
  let l:top = l:margin . '┌' . repeat('─', l:box_width) . '┐'
  let l:divider = l:margin . '├' . repeat('─', l:box_width) . '┤'
  let l:bottom = l:margin . '└' . repeat('─', l:box_width) . '┘'
  let l:controls = l:margin . '    '
  let l:system_column_width = 15
  let l:systems = [
        \ s:status('comment', !empty(maparg('gc', 'n'))),
        \ s:status('editorconfig', exists('g:loaded_EditorConfig')),
        \ s:status('matchit', exists('g:loaded_matchit')),
        \ s:status('nohlsearch', exists('g:loaded_nohlsearch')),
        \ s:status('netrw', exists(':Lexplore') == 2),
        \ s:status('fuzzy find', &wildoptions =~# 'fuzzy'),
        \ s:status('recovery', &backup && &swapfile && &undofile),
        \ ]
  let l:online = len(filter(copy(l:systems), 'v:val =~# ''^●'''))
  let l:lines = [
        \ '',
        \ l:top,
        \ s:box_line(l:margin, '', l:box_width),
        \ s:box_line(l:margin, 'T A N A A B', l:box_width),
        \ s:box_line(l:margin, '', l:box_width),
        \ s:box_line(l:margin, 'M A N E U V E R I N G', l:box_width),
        \ s:box_line(l:margin, 'S Y S T E M S', l:box_width),
        \ s:box_line(l:margin, 'L L C', l:box_width),
        \ s:box_line(l:margin, '', l:box_width),
        \ l:divider,
        \ s:box_line(l:margin, 'TANAAB-BASED  ·  TERMINAL-NATIVE  ·  VIM', l:box_width),
        \ l:bottom,
        \ '',
        \ '',
        \ l:margin . s:center(
        \   printf('NATIVE SYSTEMS  ·  %d/%d ONLINE', l:online, len(l:systems)),
        \   l:box_width + 2,
        \ ),
        \ l:controls . s:pad(l:systems[0], l:system_column_width)
        \   . s:pad(l:systems[1], l:system_column_width)
        \   . s:pad(l:systems[2], l:system_column_width)
        \   . s:pad(l:systems[3], l:system_column_width),
        \ l:controls . s:pad(l:systems[4], l:system_column_width)
        \   . s:pad(l:systems[5], l:system_column_width)
        \   . s:pad(l:systems[6], l:system_column_width)
        \   . s:pad('', l:system_column_width),
        \ '',
        \ '',
        \ l:controls . ',f  find a file                   gc  toggle a comment',
        \ l:controls . ',n  open the file browser         [b  previous buffer',
        \ l:controls . ',b  switch buffers                ]b  next buffer',
        \ '',
        \ '',
        \ l:margin . s:center('Press Enter to start editing  ·  q to close', l:box_width + 2),
        \ '',
        \ l:margin . s:center(
        \   printf('Vim %s  ·  colors inherited from the active terminal palette', l:version),
        \   l:box_width + 2,
        \ ),
        \ ]

  setlocal modifiable
  silent keepjumps %delete _
  call setline(1, l:lines)
  silent file Tanaab
  setlocal buftype=nofile
  setlocal bufhidden=wipe
  setlocal nobuflisted
  setlocal noswapfile
  setlocal nomodified
  setlocal nonumber
  setlocal norelativenumber
  setlocal nolist
  setlocal nowrap
  setlocal nospell
  setlocal colorcolumn=
  setlocal signcolumn=no
  setlocal nomodifiable

  syntax clear
  syntax match TanaabWelcomeFrame /[┌┐└┘├┤│─]/
  syntax match TanaabWelcomeLogo /T A N A A B\|M A N E U V E R I N G\|S Y S T E M S\|L L C/
  syntax match TanaabWelcomeMuted /NATIVE SYSTEMS\|[0-9]\+\/[0-9]\+ ONLINE\|Vim [0-9.]\+.*$/
  syntax match TanaabWelcomeGreen /TANAAB-BASED/
  syntax match TanaabWelcomePink /TERMINAL-NATIVE/
  syntax match TanaabWelcomeYellow /VIM/
  syntax match TanaabWelcomeOnline /●/
  syntax match TanaabWelcomeOffline /○/
  syntax match TanaabWelcomeKey /,f\|,n\|,b\|gc\|\[b\|]b/

  nnoremap <silent> <buffer> <CR> :enew<CR>
  nnoremap <silent> <buffer> q :bwipeout!<CR>
endfunction

function! tanaab#ui#trim_trailing_whitespace() abort
  if &binary || !&modifiable
    return
  endif

  let l:view = winsaveview()
  keeppatterns silent! %s/\s\+$//e
  call winrestview(l:view)
endfunction
