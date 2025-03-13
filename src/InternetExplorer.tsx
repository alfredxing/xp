import * as React from 'react';

import * as icons from './icons';

const InternetExplorerToolbar = ({ url }: { url: string }) => {
	return (
		<div className="ie__toolbar">
			<div className="ie__toolbar__menubar">
				<div className="ie__toolbar__menubar__item">File</div>
				<div className="ie__toolbar__menubar__item">Edit</div>
				<div className="ie__toolbar__menubar__item">View</div>
				<div className="ie__toolbar__menubar__item">Favorites</div>
				<div className="ie__toolbar__menubar__item">Tools</div>
				<div className="ie__toolbar__menubar__item">Help</div>
				<div className="ie__toolbar__menubar__logo" />
			</div>
			<div className="ie__toolbar__nav">
				<div className="ie__toolbar__nav__item">
					<img className="ie__toolbar__icon" src={icons.ie.back} />
					<span className="ie__toolbar__nav__label">Back</span>
					<div className="ie__toolbar__nav__arrow" />
				</div>
				<div className="ie__toolbar__nav__item ie__toolbar__nav__item--disabled">
					<img className="ie__toolbar__icon" src={icons.ie.forward} />
					<div className="ie__toolbar__nav__arrow" />
				</div>
				<div className="ie__toolbar__nav__item">
					<img className="ie__toolbar__icon" src={icons.ie.stop} />
				</div>
				<div className="ie__toolbar__nav__item">
					<img className="ie__toolbar__icon" src={icons.ie.reload} />
				</div>
				<div className="ie__toolbar__nav__item">
					<img className="ie__toolbar__icon" src={icons.ie.home} />
				</div>
				<div className="ie__toolbar__nav__divider" />
				<div className="ie__toolbar__nav__item">
					<img className="ie__toolbar__icon ie__toolbar__icon--big" src={icons.ie.search} />
					<span className="ie__toolbar__nav__label">Search</span>
				</div>
				<div className="ie__toolbar__nav__item">
					<img className="ie__toolbar__icon ie__toolbar__icon--big" src={icons.ie.favorites} />
					<span className="ie__toolbar__nav__label">Favorites</span>
				</div>
				<div className="ie__toolbar__nav__item">
					<img className="ie__toolbar__icon" src={icons.ie.history} />
				</div>
			</div>
			<div className="ie__toolbar__address status-bar">
				<div className="ie__toolbar__address__address">Address</div>
				<select className="ie__toolbar__address__select">
					<option>{url}</option>
				</select>
				<div className="ie__toolbar__address__go">
					<img className="ie__toolbar__address__go__icon" src={icons.ie.go} />
					Go
				</div>
				<div className="ie__toolbar__nav__divider" />
				<div className="ie__toolbar__address__links">Links</div>
			</div>
		</div>
	);
};

const InternetExplorerStatus = () => {
	return (
		<div className="ie__status status-bar">
			<img className="ie__status__icon" src={icons.ie.page} />
			Done
			<div style={{ marginLeft: 'auto' }} />
			<div className="ie__status__divider ie__toolbar__nav__divider" />
			<div className="ie__status__divider ie__toolbar__nav__divider" />
			<div className="ie__status__divider ie__toolbar__nav__divider" />
			<div className="ie__status__divider ie__toolbar__nav__divider" />
			<img className="ie__status__icon" src={icons.ie.internet} />
			Internet
			<div style={{ width: '10%', maxWidth: '50px' }} />
		</div>
	);
};

export const InternetExplorer = ({ url }: { url: string }) => {
	return (
		<div className="ie">
			<InternetExplorerToolbar url={url} />
			<div className="ie__content">
				<iframe src={url} className="ie__content__frame" />
				<div className="ie__content__margin ie__content__margin--e" />
				<div className="ie__content__margin ie__content__margin--w" />
			</div>
			<InternetExplorerStatus />
		</div>
	);
};
