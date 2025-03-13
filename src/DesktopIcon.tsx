import { useEffect, useState, useRef } from 'react';

interface DesktopIconProps {
	icon: string;
	label: string;
	onClick: () => void;
	isRecycleBin?: boolean;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, label, onClick, isRecycleBin }) => {
	const [isSelected, setIsSelected] = useState(false);
	const iconRef = useRef<HTMLDivElement>(null);

	const handleClick = (e: React.MouseEvent) => {
		if ('pointerType' in e.nativeEvent && e.nativeEvent.pointerType !== 'mouse') {
			onClick();
		}
		setIsSelected(true);
	};

	const handleDoubleClick = () => {
		onClick();
	};

	// Clear selection when clicking elsewhere
	const handleDesktopClick = (e: MouseEvent) => {
		if (e.target instanceof HTMLElement && e.target.closest('.desktop__icon') !== iconRef.current) {
			setIsSelected(false);
		}
	};

	useEffect(() => {
		// Add event listener to handle clicks outside
		document.addEventListener('mousedown', handleDesktopClick);
		return () => {
			document.removeEventListener('mousedown', handleDesktopClick);
		};
	}, []);

	return (
		<div
			className={`desktop__icon ${isSelected ? 'desktop__icon--selected' : ''} ${isRecycleBin ? 'desktop__icon--bin' : ''}`}
			onClick={handleClick}
			onDoubleClick={handleDoubleClick}
			ref={iconRef}
		>
			<img className="desktop__icon__image" src={icon} />
			<div className="desktop__icon__label">{label}</div>
		</div>
	);
};

export default DesktopIcon;
