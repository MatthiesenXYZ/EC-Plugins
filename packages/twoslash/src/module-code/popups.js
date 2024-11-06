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

/**
 * Sets up a tooltip for the given reference node. The tooltip will be displayed
 * when the user hovers over the reference node and will be positioned using the
 * Popper.js library.
 *
 * @param {HTMLElement} referenceNode - The DOM element to which the tooltip is attached.
 *
 * The tooltip will be appended to the `.main-pane` element if it exists, otherwise
 * it will be appended to the document body. The tooltip's position will be updated
 * dynamically based on the reference node's position.
 *
 * The tooltip will have a unique identifier for the `aria-describedby` attribute,
 * which is used for accessibility purposes.
 *
 * The tooltip will be shown on mouse enter and hidden on mouse leave.
 */
function setupTooltip(referenceNode) {
	const containerNode = document.querySelector(".main-pane") || document.body;
	const popperNode = referenceNode.querySelector(".twoslash-popup-container");

	// Compute a unique identifier to use for the aria-describedby attribute
	const randomId = `twoslash_popup_${[Math.random(), Date.now()].map((n) => n.toString(36).substring(2, 10)).join("_")}`;

	// biome-ignore lint/complexity/useOptionalChain: <explanation>
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
							mainAxis: 5,
						}),
						shift({
							padding: 10,
						}),
						size({
							padding: 10,
							apply({ availableHeight, availableWidth }) {
								Object.assign(popperNode.style, {
									maxWidth: `${Math.max(0, availableWidth)}px`,
									maxHeight: "100%",
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

/**
 * Initializes tooltips for elements with the class "twoslash" within the specified container.
 *
 * @param {HTMLElement} container - The container element in which to search for elements with the class "twoslash".
 */
function initTwoslashPopups(container) {
	// biome-ignore lint/complexity/noForEach: <explanation>
	container.querySelectorAll?.(".twoslash-hover").forEach((el) => {
		setupTooltip(el);
	});
}

initTwoslashPopups(document);

/**
 * Creates a new MutationObserver to observe changes in the DOM and initialize twoslash popups for newly added nodes.
 *
 * @constant {MutationObserver} newTwoslashPopupObserver - The MutationObserver instance that watches for added nodes.
 * @param {MutationRecord[]} mutations - Array of mutation records.
 * @param {MutationRecord} mutations[].addedNodes - List of nodes that were added.
 */
const newTwoslashPopupObserver = new MutationObserver((mutations) =>
	// biome-ignore lint/complexity/noForEach: <explanation>
	mutations.forEach((mutation) =>
		// biome-ignore lint/complexity/noForEach: <explanation>
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
