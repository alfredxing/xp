import type * as React from 'react';
import { useState, useEffect } from 'react';
import { useWindows } from './WindowsContext';
import { Taskbar } from './Taskbar';
import WindowComponent from './Window';
import DesktopIcon from './DesktopIcon';
import { InternetExplorer } from './InternetExplorer';
import { Minesweeper } from './Minesweeper';
import { WinampClone } from './Winamp';
import { Notepad } from './Notepad';
// import NotepadContent from './apps/NotepadContent';
// import AboutContent from './apps/AboutContent';

import * as icons from './icons';

export const Desktop: React.FC = () => {
	const { windows, createWindow, closeWindow } = useWindows();
	const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
	const [isWinampOpen, setIsWinampOpen] = useState(false);

	const openAlfred = () => {
		createWindow({
			title: 'Alfred - Microsoft Internet Explorer',
			content: <InternetExplorer url="alfred.html" />,
			position: { x: 72, y: 20 },
			size: { width: 1024, height: window.innerHeight - 100 },
			icon: icons.ie.page,
			taskbarIcon: IE_ICON,
		});
	};

	const openJenna = () => {
		createWindow({
			title: 'Jenna - Microsoft Internet Explorer',
			content: <InternetExplorer url="jenna.html" />,
			position: { x: 82, y: 25 },
			size: { width: 1024, height: window.innerHeight - 100 },
			icon: icons.ie.page,
			taskbarIcon: IE_ICON,
		});
	};

	const openBuch = () => {
		createWindow({
			title: 'Buch - Microsoft Internet Explorer',
			content: (
				<InternetExplorer url="https://open.spotify.com/embed/playlist/19LqP8CQgxSwedxWFGBt3f?utm_source=generator&theme=0" />
			),
			position: { x: 100, y: 50 },
			size: { width: 600, height: 600 },
			icon: icons.ie.page,
			taskbarIcon: IE_ICON,
		});
	};

	const openCarlo = () => {
		createWindow({
			title: 'Snake',
			content: <iframe src="carlo.html" style={{ width: '100%', height: '100%', border: 0 }} />,
			position: { x: 100, y: 30 },
			size: { width: 720, height: 720 },
			icon: GAME_ICON,
		});
	};

	const openScott = () => {
		createWindow({
			title: 'Scott - Microsoft Internet Explorer',
			content: <InternetExplorer url="scott.html" />,
			position: { x: 50, y: 30 },
			size: { width: 1024, height: window.innerHeight - 100 },
			icon: icons.ie.page,
			taskbarIcon: IE_ICON,
		});
	};

	const openGreg = () => {
		createWindow({
			title: 'Greg - Microsoft Internet Explorer',
			content: <InternetExplorer url="greg.html" />,
			position: { x: 50, y: 30 },
			size: { width: 1024, height: window.innerHeight - 100 },
			icon: icons.ie.page,
			taskbarIcon: IE_ICON,
		});
	};

	const openAlice = () => {
		createWindow({
			title: 'Minesweeper',
			content: <Minesweeper />,
			position: {
				x: (window.innerWidth / 2 - 246 / 2) | 0,
				y: (window.innerHeight / 2 - 337 / 2) | 0,
			},
			size: { width: 246, height: 337 },
			fixedSize: true,
			icon: MINESWEEPER_ICON,
		});
	};

	const openLalit = () => {
		const frame = document.createElement('iframe');
		frame.src = 'lalit.html';
		frame.classList.add('screen--iframe');
		document.body.append(frame);
	};

	const openSam = () => {
		const frame = document.createElement('iframe');
		frame.src = 'sam/index.html';
		frame.classList.add('screen--iframe');
		document.body.append(frame);
	};

	const openKat = () => {
		createWindow({
			title: 'Happy Notionversary Felix! - Windows Movie Maker',
			content: <iframe src="kat.html" style={{ width: '100%', height: '100%', border: 0 }} />,
			position: { x: 120, y: 20 },
			size: { width: 1024, height: 720 },
			icon: WMM_ICON,
		});
	};

	const openAlbert = () => {
		createWindow({
			title: 'Paint',
			content: (
				<iframe src="albert/index.html" style={{ width: '100%', height: '100%', border: 0 }} />
			),
			position: { x: 100, y: 25 },
			size: { width: 800, height: 720 },
			icon: PAINT_ICON,
		});
	};

	const openKim = () => {
		createWindow({
			title: "Felix's 2-Year Notion Anniversary Terminal",
			content: <iframe src="kim.html" style={{ width: '100%', height: '100%', border: 0 }} />,
			position: { x: 100, y: 50 },
			size: { width: 800, height: 600 },
			icon: CMD_ICON,
		});
	};

	const openAurora = () => {
		createWindow({
			title: 'Aurora - Microsoft Internet Explorer',
			content: <InternetExplorer url="aurora/index.html" />,
			position: { x: 80, y: 30 },
			size: { width: 1024, height: window.innerHeight - 100 },
			icon: icons.ie.page,
			taskbarIcon: IE_ICON,
		});
	};

	const openAnny = () => {
		createWindow({
			title: 'Anny - Microsoft Internet Explorer',
			content: <InternetExplorer url="anny/index.html" />,
			position: { x: 100, y: 20 },
			size: { width: 1024, height: window.innerHeight - 100 },
			icon: icons.ie.page,
			taskbarIcon: IE_ICON,
		});
	};

	const openHenry = () => {
		setIsWinampOpen(true);
	};

	const openAnkit = () => {
		createWindow({
			title: 'ankit.txt - Notepad',
			content: (
				<Notepad
					text={
						'Happy two years Felix! Thank you for all your incredibly kind and supportive mentorship over the years. I have seen web infra transform under your management into a very functional and productive team I am excited to be in, and I am very proud and grateful for that. Hope we get to work together for many years!'
					}
				/>
			),
			position: { x: 150, y: 30 },
			size: { width: 800, height: window.innerHeight * 0.5 },
		});
	};

	const openSophie = () => {
		createWindow({
			title: 'sophie.txt - Notepad',
			content: (
				<Notepad
					text={`Felix,

I thought about building you a nice calculator app but I'm not sure any of us are smart enough for that (https://chadnauseam.com/coding/random/calculator-app). Perhaps a text file is more apt for my skillset.

Happy anniversary! It's always comforting to see the level of care you put into your work. Wishing you many happy and successful years!

Sophie`}
				/>
			),
			position: { x: 120, y: 70 },
			size: { width: 800, height: window.innerHeight * 0.5 },
		});
	};

	const openYash = () => {
		createWindow({
			title: 'yash.txt - Notepad',
			content: (
				<Notepad
					text={`Felix! I admire your boundless enthusiasm so much - there’s no one I’ve seen get as happy discussing web tech as you. Beyond technical work, I can tell how deeply you care about the people on your team, as well as the craft of the Notion product, and it’s something that I really admire and now strive for myself. I hope you have an incredible Notionversary!!`}
				/>
			),
			position: { x: 90, y: 40 },
			size: { width: 800, height: window.innerHeight * 0.5 },
		});
	};

	const openSlim = () => {
		createWindow({
			title: 'slim.txt - Notepad',
			content: (
				<Notepad
					text={`  _   _      _       ____     ____   __   __                                   
 |'| |'| U  /"\\  u U|  _"\\ uU|  _"\\ u\\ \\ / /                                   
/| |_| |\\ \\/ _ \\/  \\| |_) |/\\| |_) |/ \\ V /                                    
U|  _  |u / ___ \\   |  __/   |  __/  U_|"|_u                                   
 |_| |_| /_/   \\_\\  |_|      |_|       |_|                                     
 //   \\\\  \\\\    >>  ||>>_    ||>>_ .-,//|(_                                    
(_") ("_)(__)  (__)(__)__)  (__)__) \\_) (__)                                   
   ____               ____      _____    _   _    ____       _      __   __    
U | __")u    ___   U |  _"\\ u  |_ " _|  |'| |'|  |  _"\\  U  /"\\  u  \\ \\ / /    
 \\|  _ \\/   |_"_|   \\| |_) |/    | |   /| |_| |\\/| | | |  \\/ _ \\/    \\ V /     
  | |_) |    | |     |  _ <     /| |\\  U|  _  |uU| |_| |\\ / ___ \\   U_|"|_u    
  |____/   U/| |\\u   |_| \\_\\   u |_|U   |_| |_|  |____/ u/_/   \\_\\    |_|      
 _|| \\\\_.-,_|___|_,-.//   \\\\_  _// \\\\_  //   \\\\   |||_    \\\\    >>.-,//|(_     
(__) (__)\\_)-' '-(_/(__)  (__)(__) (__)(_") ("_) (__)_)  (__)  (__)\\_) (__)    
  _____ U _____ u  _                   __  __                                  
 |" ___|\\| ___"|/ |"|        ___       \\ \\/"/                                  
U| |_  u |  _|" U | | u     |_"_|      /\\  /\\                                  
\\|  _|/  | |___  \\| |/__     | |      U /  \\ u                                 
 |_|     |_____|  |_____|  U/| |\\u     /_/\\_\\                                  
 )(\\\\,-  <<   >>  //  \\\\.-,_|___|_,-.,-,>> \\\\_                                 
(__)(_/ (__) (__)(_")("_)\\_)-' '-(_/  \\_)  (__)                                

I wanted to spell out the above using Strava, but I am allergic to running.
I'm glad we get to work together! Your level of investment in your work + team
is both evident and inspiring. Congrats on a wonderful two years and wishing 
you many successful Strava rides to come!

Slim`}
				/>
			),
			position: { x: 70, y: 30 },
			size: { width: 800, height: 700 },
		});
	};

	const openExplorer = () => {
		createWindow({
			title: 'explorer.exe',
			content: (() => {
				const onClick = (e: React.MouseEvent) => {
					const windowElement = e.currentTarget.closest('.window');
					const windowId = windowElement?.getAttribute('data-id');
					if (windowId) closeWindow(windowId);
				};

				return (
					<div style={{ padding: '8px 0 16px' }}>
						<p style={{ textAlign: 'center', margin: '1em 0' }}>Application not found.</p>
						<section className="field-row" style={{ justifyContent: 'center' }}>
							<button onClick={onClick}>OK</button>
						</section>
					</div>
				);
			})(),
			position: { x: 100, y: 100 },
			size: { width: 300, height: 124 },
			fixedSize: true,
		});
	};

	const handleDesktopContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		setClickPosition({ x: e.clientX, y: e.clientY });
	};

	useEffect(() => {
		const listener = (e: MessageEvent) => {
			if (e.data === 'reboot') {
				window.location.reload();
			}
		};
		window.addEventListener('message', listener);
		return () => window.removeEventListener('message', listener);
	}, []);

	return (
		<div className="screen desktop" onContextMenu={handleDesktopContextMenu}>
			<div className="desktop__icons">
				<DesktopIcon icon={CD_ICON} label="Buch" onClick={openBuch} />
				<DesktopIcon icon={URL_ICON} label="Alfred" onClick={openAlfred} />
				<DesktopIcon icon={URL_ICON} label="Jenna" onClick={openJenna} />
				<DesktopIcon icon={TEXT_ICON} label="Slim" onClick={openSlim} />
				<DesktopIcon icon={GAME_ICON} label="Carlo" onClick={openCarlo} />
				<DesktopIcon icon={URL_ICON} label="Scott" onClick={openScott} />
				<DesktopIcon icon={URL_ICON} label="Greg" onClick={openGreg} />
				<DesktopIcon icon={WMM_ICON} label="Kat" onClick={openKat} />
				<DesktopIcon icon={MINESWEEPER_ICON} label="Alice" onClick={openAlice} />
				<DesktopIcon icon={TEXT_ICON} label="Sophie" onClick={openSophie} />
				<DesktopIcon icon={VISTA_ICON} label="Lalit" onClick={openLalit} />
				<DesktopIcon icon={PAINT_ICON} label="Albert" onClick={openAlbert} />
				<DesktopIcon icon={TEXT_ICON} label="Yash" onClick={openYash} />
				<DesktopIcon icon={CMD_ICON} label="Kim" onClick={openKim} />
				<DesktopIcon icon={WINAMP_ICON} label="Henry" onClick={openHenry} />
				<DesktopIcon icon={URL_ICON} label="Aurora" onClick={openAurora} />
				<DesktopIcon icon={UPDATE_ICON} label="Sam" onClick={openSam} />
				<DesktopIcon icon={TEXT_ICON} label="Ankit" onClick={openAnkit} />
				<DesktopIcon icon={URL_ICON} label="Anny" onClick={openAnny} />
				<DesktopIcon icon={RECYCLE_ICON} label="Recycle Bin" isRecycleBin onClick={openExplorer} />
			</div>
			{isWinampOpen && <WinampClone close={() => setIsWinampOpen(false)} />}
			{windows.map(
				(window) => !window.isMinimized && <WindowComponent key={window.id} window={window} />,
			)}
			<Taskbar />
		</div>
	);
};

// Icons
const TEXT_ICON = new URL('./assets/notepad.png', import.meta.url).toString();
const HTML_ICON = new URL('./assets/html.png', import.meta.url).toString();
const IE_ICON = new URL('./assets/ie.png', import.meta.url).toString();
const RECYCLE_ICON = new URL('./assets/recycle.png', import.meta.url).toString();
const SPOTIFY_ICON = new URL('./assets/spotify.png', import.meta.url).toString();
const CD_ICON = new URL('./assets/cd.png', import.meta.url).toString();
const CMD_ICON = new URL('./assets/cmd.png', import.meta.url).toString();
const PAINT_ICON = new URL('./assets/paint.png', import.meta.url).toString();
const MINESWEEPER_ICON = new URL('./assets/minesweeper.png', import.meta.url).toString();
const WMM_ICON = new URL('./assets/wmm.png', import.meta.url).toString();
const URL_ICON = new URL('./assets/url.png', import.meta.url).toString();
const WINAMP_ICON = new URL('./assets/winamp.png', import.meta.url).toString();
const PINBALL_ICON = new URL('./assets/pinball.png', import.meta.url).toString();
const GAME_ICON = new URL('./assets/game.png', import.meta.url).toString();
const VISTA_ICON = new URL('./assets/vista.png', import.meta.url).toString();
const UPDATE_ICON = new URL('./assets/update.png', import.meta.url).toString();
