import { createContext, useState, useContext, ReactNode } from 'react';

// Define the Window type
export interface Window {
	id: string;
	title: string;
	content: ReactNode;
	isMinimized: boolean;
	isMaximized: boolean;
	zIndex: number;
	position: { x: number; y: number };
	// For maximized windows, this is the size before maximizing
	// For normal windows, this is the current size
	size: { width: number; height: number };
	icon?: string;
	taskbarIcon?: string;
	fixedSize?: boolean;
}

interface WindowsContextType {
	windows: Window[];
	activeWindowId: string | null;
	createWindow: (window: Omit<Window, 'id' | 'isMinimized' | 'isMaximized' | 'zIndex'>) => void;
	closeWindow: (id: string) => void;
	minimizeWindow: (id: string) => void;
	maximizeWindow: (id: string) => void;
	restoreWindow: (id: string) => void;
	focusWindow: (id: string) => void;
	updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
	updateWindowSize: (id: string, size: { width: number; height: number }) => void;
}

const WindowsContext = createContext<WindowsContextType | undefined>(undefined);

export const useWindows = () => {
	const context = useContext(WindowsContext);
	if (context === undefined) {
		throw new Error('useWindows must be used within a WindowsProvider');
	}
	return context;
};

export const WindowsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [windows, setWindows] = useState<Window[]>([]);
	const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
	const [maxZIndex, setMaxZIndex] = useState(0);

	const createWindow = (window: Omit<Window, 'id' | 'isMinimized' | 'isMaximized' | 'zIndex'>) => {
		const newZIndex = maxZIndex + 1;
		const id = Math.random().toString(36).substr(2, 9);
		const isSmallViewport = globalThis.innerWidth <= 1024;

		const newWindow: Window = {
			...window,
			id,
			isMinimized: false,
			isMaximized: isSmallViewport,
			zIndex: newZIndex,
		};

		setWindows((prevWindows) => {
			return [...prevWindows, newWindow];
		});

		// Need to call this after the state update
		setTimeout(() => {
			focusWindow(id);
			setMaxZIndex(newZIndex);
		}, 0);
	};

	const closeWindow = (id: string) => {
		setWindows((prevWindows) => {
			const filteredWindows = prevWindows.filter((window) => window.id !== id);
			return filteredWindows;
		});

		if (activeWindowId === id) {
			setWindows((prevWindows) => {
				const remainingWindows = prevWindows.filter((window) => window.id !== id);
				if (remainingWindows.length > 0) {
					// Focus the window with the highest zIndex
					const highestZIndexWindow = remainingWindows.reduce((prev, current) =>
						prev.zIndex > current.zIndex ? prev : current,
					);
					setActiveWindowId(highestZIndexWindow.id);
				} else {
					setActiveWindowId(null);
				}
				return prevWindows;
			});
		}
	};

	const minimizeWindow = (id: string) => {
		setWindows((prevWindows) =>
			prevWindows.map((window) => (window.id === id ? { ...window, isMinimized: true } : window)),
		);

		setWindows((prevWindows) => {
			// Focus the window with the next highest zIndex
			const visibleWindows = prevWindows.filter(
				(window) => !window.isMinimized && window.id !== id,
			);

			if (visibleWindows.length > 0) {
				const highestZIndexWindow = visibleWindows.reduce((prev, current) =>
					prev.zIndex > current.zIndex ? prev : current,
				);
				setActiveWindowId(highestZIndexWindow.id);
			} else {
				setActiveWindowId(null);
			}

			return prevWindows;
		});
	};

	const maximizeWindow = (id: string) => {
		setWindows((prevWindows) =>
			prevWindows.map((window) =>
				window.id === id ? { ...window, isMaximized: true, isMinimized: false } : window,
			),
		);

		setTimeout(() => {
			focusWindow(id);
		}, 0);
	};

	const restoreWindow = (id: string) => {
		setWindows((prevWindows) =>
			prevWindows.map((window) =>
				window.id === id
					? {
							...window,
							isMaximized: false,
							isMinimized: false,
						}
					: window,
			),
		);

		setTimeout(() => {
			focusWindow(id);
		}, 0);
	};

	const focusWindow = (id: string) => {
		console.log('Focusing window:', id, 'Current active:', activeWindowId);
		if (id === activeWindowId) return;

		const newZIndex = maxZIndex + 1;
		console.log('New zIndex:', newZIndex);

		setWindows((prevWindows) => {
			console.log('Windows when focusing:', prevWindows);
			const windowToFocus = prevWindows.find((w) => w.id === id);
			if (!windowToFocus) {
				console.warn('Tried to focus window that does not exist:', id);
				return prevWindows;
			}

			return prevWindows.map((window) =>
				window.id === id ? { ...window, zIndex: newZIndex, isMinimized: false } : window,
			);
		});

		setActiveWindowId(id);
		setMaxZIndex(newZIndex);
	};

	const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
		console.log('Updating position for window', id, position);
		setWindows((prevWindows) =>
			prevWindows.map((window) => (window.id === id ? { ...window, position } : window)),
		);
	};

	const updateWindowSize = (id: string, size: { width: number; height: number }) => {
		console.log('Updating size for window', id, size);
		setWindows((prevWindows) =>
			prevWindows.map((window) => (window.id === id ? { ...window, size } : window)),
		);
	};

	return (
		<WindowsContext.Provider
			value={{
				windows,
				activeWindowId,
				createWindow,
				closeWindow,
				minimizeWindow,
				maximizeWindow,
				restoreWindow,
				focusWindow,
				updateWindowPosition,
				updateWindowSize,
			}}
		>
			{children}
		</WindowsContext.Provider>
	);
};
