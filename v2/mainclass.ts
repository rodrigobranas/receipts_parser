import receipts1 from "../receipts/receipts1";
import receipts2 from "../receipts/receipts2";
import receipts3 from "../receipts/receipts3";
import receipts4 from "../receipts/receipts4";
import receipts5 from "../receipts/receipts5";
import receipts6 from "../receipts/receipts6";
import ReceiptsParser from "./ReceiptsParser";
import ReceiptsParserAdapter from "./ReceiptsParserAdapter";

const receipts: any = {
	1: receipts1,
	2: receipts2,
	3: receipts3,
	4: receipts4,
	5: receipts5,
	6: receipts6
}

const index = parseInt(process.argv[2]);

const parser = new ReceiptsParser();
const output = parser.parse(receipts[index]);
for (const item of output) {
	console.log(item.indent, item.arrow, item.type);
}

// const compatibleParser = new ReceiptsParserAdapter(new ReceiptsParser());
// const compatibleOutput = compatibleParser.parse(receipts[index]);
// console.log(compatibleOutput);