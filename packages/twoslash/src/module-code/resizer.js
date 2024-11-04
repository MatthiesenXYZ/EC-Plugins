// This file is used to resize the twoslash popups to fit within the code block

// To minify this file, use: https://www.toptal.com/developers/javascript-minifier

const calculateTwoslashPopupSize = () => {
	const holder = document.querySelectorAll(".mane-pane");

	for (const block of holder) {
		const twoslashPopups = block.querySelectorAll(".twoslash-popup-container");

		for (const container of twoslashPopups) {
			const parentWidth = block.clientWidth;
			const containerPos =
				container.getBoundingClientRect().left -
				block.getBoundingClientRect().left +
				16;
			const containerWidth = container.clientWidth;

			if (containerWidth > parentWidth - containerPos) {
				container.style.setProperty(
					"width",
					`${parentWidth - containerPos}px`,
					"important",
				);
			}
		}
	}
};

calculateTwoslashPopupSize();

document.addEventListener("resize", calculateTwoslashPopupSize);
