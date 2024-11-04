// This file is used to create the popups for the twoslash code blocks
// It uses the floating-ui library to position the popup
// It also uses the MutationObserver to update the popups when the page changes
// It also listens for the astro:page-load event to update the popups when the page is loaded

// To minify this file, use: https://www.toptal.com/developers/javascript-minifier

import {
	computePosition,
	offset,
	shift,
	size,
} from "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.10/+esm";

function setupTooltip(referenceNode) {
	const containerNode = document.querySelector(".main-pane") || document.body;
	const popperNode = referenceNode.querySelector(".twoslash-popup-container");

	// Compute a unique identifier to use for the aria-describedby attribute
	const randomId = `twoslash_popup_${[Math.random(), Date.now()].map((n) => n.toString(36).substring(2, 10)).join("_")}`;

	if (popperNode && popperNode.parentNode) {
		popperNode.parentNode.removeChild(popperNode);
	}

	function updatePosition() {
		containerNode.appendChild(popperNode);
		new Promise((resolve) =>
			requestAnimationFrame(() => {
				requestAnimationFrame(resolve);
			}),
		)
			.then(() =>
				computePosition(referenceNode, popperNode, {
					placement: "bottom-start",
					middleware: [
						offset({
							mainAxis: 1,
						}),
						shift({
							padding: 10,
						}),
						size({
							padding: 10,
							apply({ availableHeight, availableWidth }) {
								Object.assign(popperNode.style, {
									maxWidth: `${Math.max(0, availableWidth)}px`,
									maxHeight: `${Math.max(0, availableHeight)}px`,
								});
							},
						}),
					],
				}),
			)
			.then(({ x, y }) => {
				Object.assign(popperNode.style, {
					display: "block",
					left: `${x}px`,
					top: `${y}px`,
				});
			});
	}

	referenceNode.addEventListener("mouseenter", () => {
		updatePosition();
		popperNode.setAttribute("aria-hidden", "false");
		referenceNode
			.querySelector(".twoslash-hover span")
			?.setAttribute("aria-describedby", randomId);
		popperNode.setAttribute("id", randomId);
	});
	referenceNode.addEventListener("mouseleave", () => {
		containerNode.removeChild(popperNode);
		popperNode.setAttribute("aria-hidden", "true");
		referenceNode
			.querySelector(".twoslash-hover span")
			?.removeAttribute("aria-describedby");
		popperNode.removeAttribute("id");
	});
}

function initTwoslashPopups(container) {
	container.querySelectorAll?.(".twoslash").forEach((el) => {
		setupTooltip(el);
	});
}

initTwoslashPopups(document);

const newTwoslashPopupObserver = new MutationObserver((mutations) =>
	mutations.forEach((mutation) =>
		mutation.addedNodes.forEach((node) => {
			initTwoslashPopups(node);
		}),
	),
);
newTwoslashPopupObserver.observe(document.body, {
	childList: true,
	subtree: true,
});

document.addEventListener("astro:page-load", () => {
	initTwoslashPopups(document);
});
