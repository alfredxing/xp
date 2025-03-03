import type * as React from 'react';
import { useState } from 'react';
import { useWindows } from './WindowsContext';
import { Taskbar } from './Taskbar';
import WindowComponent from './Window';
import DesktopIcon from './DesktopIcon';
// import NotepadContent from './apps/NotepadContent';
// import AboutContent from './apps/AboutContent';

export const Desktop: React.FC = () => {
	const { windows, createWindow } = useWindows();
	const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

	const openNotepad = () => {
		createWindow({
			title: 'Notepad',
			content: <div />, // <NotepadContent />,
			position: { x: 100, y: 100 },
			size: { width: 800, height: 600 },
			icon: '📝',
		});
	};

	const openAbout = () => {
		createWindow({
			title: 'About',
			content: <div />, // <AboutContent />,
			position: { x: 150, y: 150 },
			size: { width: 800, height: 600 },
			icon: 'ℹ️',
		});
	};

	const handleDesktopContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		setClickPosition({ x: e.clientX, y: e.clientY });
	};

	return (
		<div className="screen desktop" onContextMenu={handleDesktopContextMenu}>
			<div className="desktop__icons">
				<DesktopIcon icon="📝" label="Notepad" onClick={openNotepad} />
				<DesktopIcon icon="ℹ️" label="About" onClick={openAbout} />
				<DesktopIcon icon="🗑️" label="Recycle Bin" isRecycleBin onClick={() => {}} />
			</div>
			{windows.map(
				(window) => !window.isMinimized && <WindowComponent key={window.id} window={window} />,
			)}
			<Taskbar />
		</div>
	);
};
