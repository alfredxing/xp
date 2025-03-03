import { useState, useEffect, useMemo } from 'react';

import { Desktop } from './Desktop';
import { WindowsProvider } from './WindowsContext';

export function Bootloader() {
	const [booted, setBooted] = useState(false);
	const hasBooted = useMemo(() => !!window.localStorage.getItem('booted'), []);

	useEffect(() => {
		window.localStorage.setItem('booted', 'true');
		setTimeout(() => setBooted(true), hasBooted ? 2500 : 5000);
	}, []);

	if (booted) {
		return (
			<WindowsProvider>
				<Desktop />
			</WindowsProvider>
		);
	} else {
		return (
			<div className="screen booting">
				<img
					src={new URL('./assets/boot-logo.png', import.meta.url).toString()}
					className="booting__logo"
				/>
				<div className="booting__progress">
					<img
						src={new URL('./assets/boot-progress.png', import.meta.url).toString()}
						className="booting__progress__bar"
					/>
				</div>
				<div className="booting__copy">
					Copyright &copy; 1985-2025
					<br />
					Notion Labs Inc.
				</div>
			</div>
		);
	}
}
