// @ts-nocheck
import receipts1 from "../receipts/receipts1";
import receipts2 from "../receipts/receipts2";
import receipts3 from "../receipts/receipts3";
import receipts4 from "../receipts/receipts4";
import receipts5 from "../receipts/receipts5";
import receipts6 from "../receipts/receipts6";

const receipts: any = {
	1: receipts1,
	2: receipts2,
	3: receipts3,
	4: receipts4,
	5: receipts5,
	6: receipts6
}

const index = parseInt(process.argv[2]);

function clean (obj: any) {
	return Object.entries(obj).reduce((a: any, [k, v]) => (v == null ? a : (a[k] = v, a)), {});
}

function generate(receipts: any) {
	let indent = 0;
	const flow = [];
	for (const [index, item] of receipts.entries()) {
		const type = item.receiptType;
		const previousItem = receipts[index - 1] || {};
		if (previousItem.receiptType !== "RETURN" && type === "SCRIPT_RESULT") indent = 0;
		const arrow = `${"-".repeat(indent + 1)}>`;
		flow.push({ indent, arrow, type, data: clean(item) });
		if (["CALL", "RETURN"].includes(type)) indent++;
		if (["RETURN_DATA"].includes(type) && indent > 0) indent--;
	}
	return flow;
}

const output = generate(receipts[index]);
// for (const item of output) {
// 	console.log(item.indent, item.arrow, item.type);
// 	console.log(item.data);
// }

const data: any = [];
let indent = 0;
let pointer = data;
let lastPointer = {};
for (const [index, item] of output.entries()) {
	const next = output[index + 1];
	const obj = { type: item.type, item: { receiptType: item.type } };
	if (["CALL", "RETURN"].includes(item.type)) obj.receipts = [];
	pointer.push(obj);
	if (next && (next.indent > item.indent)) {
		lastPointer[item.indent] = pointer;
		pointer = obj.receipts;
	}
	if (next && (next.indent < item.indent)) {
		pointer = lastPointer[next.indent];
	}
}

console.log(JSON.stringify(data, undefined, "  "));

// function render () {
// 	const output = data;
// 	for (const item of output) {
// 		let depth = 0;
// 		console.log(depth, "-", ">", item.type, item.receipts.length);
// 		renderR(item, depth);
// 	}
// }

// function renderR (item: any, depth: number) {
// 	depth++;
// 	if (!item.receipts.length) return;
// 	for (const subitem of item.receipts) {
// 		const length = subitem.receipts?.length || 0;
// 		const type = subitem.item.receiptType;
// 		console.log(depth, "-".repeat(depth * 2), ">", type, length);
// 		if (length > 0) renderR(subitem, depth);
// 	}
// }

// render();
