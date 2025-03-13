import { useState, useEffect } from 'react';
import { useWindows } from './WindowsContext';

export const Taskbar = ({ openExplorer }: { openExplorer: () => void }) => {
	const { windows, activeWindowId, focusWindow, restoreWindow, minimizeWindow } = useWindows();
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

	return (
		<div className="taskbar">
			<div className="taskbar__start" onClick={openExplorer} />
			<div className="taskbar__items">
				{windows.map((window) => (
					<div
						key={window.id}
						className={`taskbar__item ${activeWindowId === window.id && !window.isMinimized ? 'taskbar__item--active' : 'taskbar__item--inactive'}`}
						onClick={() => handleTaskbarItemClick(window.id)}
					>
						{(window.taskbarIcon ?? window.icon) && (
							<img
								width={16}
								src={window.taskbarIcon ?? window.icon}
								style={{ marginRight: '5px', marginLeft: '-2px', transform: 'translateY(1px)' }}
							/>
						)}
						<span className="taskbar__item__label">{window.title}</span>
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
