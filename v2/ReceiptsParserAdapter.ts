import ReceiptsParser from "./ReceiptsParser";

export default class ReceiptsParserAdapter {

	constructor (readonly receiptsParser: ReceiptsParser) {
	}

	parse (receipts: any) {
		const output = this.receiptsParser.parse(receipts);
		return this.convert(output);
	}

	convert (output: any) {
		const data: any = [];
		let pointer = data;
		let lastPointer: any = {};
		for (const [index, item] of output.entries()) {
			const next = output[index + 1];
			const obj = { type: item.type, item: item.data } as any;
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
		return data;
	}
}
