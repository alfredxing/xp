import type * as React from 'react';
import { useState, useEffect } from 'react';
import { useWindows } from './WindowsContext';

export const Taskbar: React.FC = () => {
	const {
		windows,
		activeWindowId,
		focusWindow,
		restoreWindow,
		minimizeWindow,
		createWindow,
		closeWindow,
	} = useWindows();
	const [currentTime, setCurrentTime] = useState(new Date());

	// Update the clock
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => {
			clearInterval(timer);
		};
	}, []);

	const formatTime = (date: Date) => {
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const displayHours = hours % 12 || 12;
		const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

		return `${displayHours}:${displayMinutes} ${ampm}`;
	};

	// Click handler for taskbar items
	const handleTaskbarItemClick = (windowId: string) => {
		const window = windows.find((w) => w.id === windowId);

		if (window) {
			if (window.isMinimized) {
				restoreWindow(windowId);
			} else if (activeWindowId === windowId) {
				// If it's already the active window, minimize it
				// (Windows XP behavior)
				minimizeWindow(windowId);
			} else {
				focusWindow(windowId);
			}
		}
	};

	// Handle start button click
	const handleStartClick = () => {
		createWindow({
			title: 'explorer.exe',
			content: (
				<div
					style={{ height: '100%', padding: '20px', textAlign: 'center', background: '#ECE9D8' }}
				>
					<p style={{ marginBottom: '15px' }}>Application not found</p>
					<button
						onClick={(e) => {
							const windowElement = e.currentTarget.closest('.window');
							const windowId = windowElement?.getAttribute('data-id');
							if (windowId) closeWindow(windowId);
						}}
					>
						OK
					</button>
				</div>
			),
			position: { x: 100, y: 100 },
			size: { width: 300, height: 150 },
		});
	};

	return (
		<div className="taskbar">
			<div className="taskbar__start" onClick={handleStartClick} />
			<div className="taskbar__items">
				{windows.map((window) => (
					<div
						key={window.id}
						className={`taskbar__item ${activeWindowId === window.id && !window.isMinimized ? 'taskbar__item--active' : 'taskbar__item--inactive'}`}
						onClick={() => handleTaskbarItemClick(window.id)}
					>
						{window.icon && <span style={{ marginRight: '5px' }}>{window.icon}</span>}
						{window.title}
					</div>
				))}
			</div>
			<div className="taskbar__tray">
				<div className="taskbar__tray__msn" />
				{formatTime(currentTime)}
			</div>
		</div>
	);
};
