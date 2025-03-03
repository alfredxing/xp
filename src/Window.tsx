import { useState, useRef } from 'react';
import { useWindows, Window as WindowType } from './WindowsContext';

interface WindowProps {
	window: WindowType;
}

const Window: React.FC<WindowProps> = ({ window }) => {
	const {
		activeWindowId,
		focusWindow,
		closeWindow,
		minimizeWindow,
		maximizeWindow,
		restoreWindow,
		updateWindowPosition,
		updateWindowSize,
	} = useWindows();

	// Used to track drag state
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

	const isActive = activeWindowId === window.id;

	// Handle window focus
	const handleWindowFocus = () => {
		if (!isActive) {
			focusWindow(window.id);
		}
	};

	// Drag handlers
	const handleDragStart = (e: React.MouseEvent) => {
		if (window.isMaximized) return;

		e.preventDefault();

		// Store the initial mouse position and window position
		const initialMouseX = e.clientX;
		const initialMouseY = e.clientY;
		const initialWindowX = window.position.x;
		const initialWindowY = window.position.y;

		// Calculate the offset (distance from the top-left corner of the window)
		const offsetX = initialMouseX - initialWindowX;
		const offsetY = initialMouseY - initialWindowY;

		// Store these values for use during dragging
		setDragOffset({ x: offsetX, y: offsetY });

		// Define the move handler to calculate position during drag
		const handleDragMove = (moveEvent: MouseEvent) => {
			// Calculate new window position based on the original offset
			const newX = moveEvent.clientX - offsetX;
			const newY = moveEvent.clientY - offsetY;

			// Update window position
			updateWindowPosition(window.id, { x: newX, y: newY });
		};

		// Define the end handler to clean up
		const handleDragEnd = () => {
			document.removeEventListener('mousemove', handleDragMove);
			document.removeEventListener('mouseup', handleDragEnd);
		};

		// Add event listeners
		document.addEventListener('mousemove', handleDragMove);
		document.addEventListener('mouseup', handleDragEnd);
	};

	// We've moved drag handlers inside handleDragStart

	// Handle minimize, maximize, close
	const handleMinimize = () => {
		minimizeWindow(window.id);
	};

	const handleMaximizeToggle = () => {
		if (window.isMaximized) {
			restoreWindow(window.id);
		} else {
			maximizeWindow(window.id);
		}
	};

	const handleClose = () => {
		closeWindow(window.id);
	};

	// Compute window style
	const windowStyle: React.CSSProperties = {
		position: 'absolute',
		zIndex: window.zIndex,
		...(window.isMaximized
			? {
					top: 0,
					left: 0,
					width: '100%',
					height: 'calc(100% - 30px)', // Subtract taskbar height
					borderRadius: '0',
				}
			: {
					transform: `translate(${window.position.x}px, ${window.position.y}px)`,
					width: `${window.size.width}px`,
					height: `${window.size.height}px`,
				}),
	};

	// Generic resize handler
	const handleResize = (e: React.MouseEvent, direction: string) => {
		e.preventDefault();
		e.stopPropagation();

		// Store initial values
		const startX = e.clientX;
		const startY = e.clientY;
		const startPos = { ...window.position };
		const startSize = { ...window.size };

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const deltaX = moveEvent.clientX - startX;
			const deltaY = moveEvent.clientY - startY;

			let newX = startPos.x;
			let newY = startPos.y;
			let newWidth = startSize.width;
			let newHeight = startSize.height;

			// Handle resize based on direction
			switch (direction) {
				case 'e': // East (right edge)
					newWidth = Math.max(200, startSize.width + deltaX);
					break;

				case 'w': // West (left edge)
					newWidth = Math.max(200, startSize.width - deltaX);
					newX = startPos.x + startSize.width - newWidth;
					break;

				case 's': // South (bottom edge)
					newHeight = Math.max(150, startSize.height + deltaY);
					break;

				case 'n': // North (top edge)
					newHeight = Math.max(150, startSize.height - deltaY);
					newY = startPos.y + startSize.height - newHeight;
					break;

				case 'se': // Southeast (bottom-right corner)
					newWidth = Math.max(200, startSize.width + deltaX);
					newHeight = Math.max(150, startSize.height + deltaY);
					break;

				case 'sw': // Southwest (bottom-left corner)
					newWidth = Math.max(200, startSize.width - deltaX);
					newX = startPos.x + startSize.width - newWidth;
					newHeight = Math.max(150, startSize.height + deltaY);
					break;

				case 'ne': // Northeast (top-right corner)
					newWidth = Math.max(200, startSize.width + deltaX);
					newHeight = Math.max(150, startSize.height - deltaY);
					newY = startPos.y + startSize.height - newHeight;
					break;

				case 'nw': // Northwest (top-left corner)
					newWidth = Math.max(200, startSize.width - deltaX);
					newX = startPos.x + startSize.width - newWidth;
					newHeight = Math.max(150, startSize.height - deltaY);
					newY = startPos.y + startSize.height - newHeight;
					break;
			}

			// Update window size and position
			updateWindowSize(window.id, { width: newWidth, height: newHeight });
			updateWindowPosition(window.id, { x: newX, y: newY });
		};

		const handleMouseUp = () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	return (
		<div
			className={`window ${!isActive ? 'window--inactive' : ''}`}
			style={windowStyle}
			onMouseDown={handleWindowFocus}
			data-id={window.id}
		>
			{/* Titlebar */}
			<div
				className="window__titlebar"
				onMouseDown={handleDragStart}
				onDoubleClick={handleMaximizeToggle}
			>
				<div className="window__titlebar__title">
					{window.icon && <span className="window__titlebar__title__icon">{window.icon}</span>}
					{window.title}
				</div>
				<div className="window__titlebar__controls">
					<div
						className="window__titlebar__control window__titlebar__control--minimize"
						onClick={handleMinimize}
					/>
					<div
						className="window__titlebar__control window__titlebar__control--maximize"
						onClick={handleMaximizeToggle}
					/>
					<div
						className="window__titlebar__control window__titlebar__control--close"
						onClick={handleClose}
					/>
				</div>
			</div>

			{/* Content */}
			<div className="window__content">{window.content}</div>

			{/* Resize handles */}
			{!window.isMaximized && (
				<>
					{/* Right edge */}
					<div
						className="window__resize_handle window__resize_handle--e"
						onMouseDown={(e) => handleResize(e, 'e')}
					></div>

					{/* Left edge */}
					<div
						className="window__resize_handle window__resize_handle--w"
						onMouseDown={(e) => handleResize(e, 'w')}
					></div>

					{/* Bottom edge */}
					<div
						className="window__resize_handle window__resize_handle--s"
						onMouseDown={(e) => handleResize(e, 's')}
					></div>

					{/* Top edge */}
					<div
						className="window__resize_handle window__resize_handle--n"
						onMouseDown={(e) => handleResize(e, 'n')}
					></div>

					{/* Bottom-right corner */}
					<div
						className="window__resize_handle window__resize_handle--se"
						onMouseDown={(e) => handleResize(e, 'se')}
					></div>

					{/* Bottom-left corner */}
					<div
						className="window__resize_handle window__resize_handle--sw"
						onMouseDown={(e) => handleResize(e, 'sw')}
					></div>

					{/* Top-right corner */}
					<div
						className="window__resize_handle window__resize_handle--ne"
						onMouseDown={(e) => handleResize(e, 'ne')}
					></div>

					{/* Top-left corner */}
					<div
						className="window__resize_handle window__resize_handle--nw"
						onMouseDown={(e) => handleResize(e, 'nw')}
					></div>
				</>
			)}
		</div>
	);
};

export default Window;