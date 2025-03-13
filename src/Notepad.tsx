import * as React from 'react';

export const Notepad = ({ text }: { text: string }) => (
	<div className="notepad">
		<div className="ie__toolbar__menubar">
			<div className="ie__toolbar__menubar__item">File</div>
			<div className="ie__toolbar__menubar__item">Edit</div>
			<div className="ie__toolbar__menubar__item">Format</div>
			<div className="ie__toolbar__menubar__item">View</div>
			<div className="ie__toolbar__menubar__item">Help</div>
		</div>
		<textarea className="notepad__textarea" spellcheck="false">
			{text}
		</textarea>
	</div>
);
