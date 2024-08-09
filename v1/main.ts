import receipts from "../receipts/receipts6";

export class Generate {

	public createOperations(receipts: any[]) {
	  if (!receipts.length) return null;
	  const hasError = receipts.some(isError);
	  const output = receipts.reduce((acc, receipt, idx) => {
		const prev = receipts[idx - 1];
		const isPrevReturnData = isReturnData(prev);
		const isFirstCall = isCall(receipt) && idx === 0;
		const isCurrentCall = isCall(receipt) && isPrevReturnData;
		const isRootCall = isFirstCall || isCurrentCall;
		const isOnlyResult = hasError && isResult(receipt);
		const isFinalReturn = isReturn(receipt);
  
		if (isRootCall || isOnlyResult || isFinalReturn) {
		  const type = getType(receipt);
		  const findNextReturnIdx = this.findNextReturnIdx(
			receipts,
			idx,
			hasError,
		  );
		  const nextReturnIdx = receipts.findIndex(findNextReturnIdx);
		  const range = isRootCall
			? [...receipts].slice(idx, nextReturnIdx + 1)
			: [...receipts].slice(idx);
		  const items = this.createItems(range);
		  return [...acc, { type, receipts: items }];
		}
		return acc;
	  }, []);
	  return output;
	}
  
	private createItems(receipts: any[]) {
	  const nestedIntervals = this.findNestedIntervals(receipts);
	  return receipts.reduce((acc, receipt, idx) => {
		// @ts-ignore
		const range = nestedIntervals.find(([start, end]) => {
		  return idx >= start && idx <= end;
		});
		if (range && isCall(receipt)) {
		  const startRange = range[0] + 1;
		  const endRange = range[1] + 1;
		  const nested = [...receipts].slice(startRange, endRange);
		  const items = this.createItems(nested);
		  const next = { item: receipt, receipts: items };
		  return [...acc, next];
		}
		if (!range) {
		  return [...acc, { item: receipt }];
		}
		return acc;
	  }, []);
	}
  
	private findNestedIntervals(receipts: any[]) {
	  return receipts.reduce((acc, r, idx) => {
		const prev = receipts[idx - 1];
		const isPrevReturn = isReturn(prev);
		const isFirstCall = isCall(r) && idx === 0;
  
		if (isCall(r) && !isFirstCall && !isPrevReturn) {
		  const findNextReturnIdx = this.findNextReturnIdx(receipts, idx);
		  const nextReturnIdx = receipts.findIndex(findNextReturnIdx);
		  return [...acc, [idx, nextReturnIdx]];
		}
		return acc;
	  }, [] as number[][]);
	}
  
	private findNextReturnIdx(
	  receipts: any[],
	  idx: number,
	  hasError?: boolean,
	) {
	  return (receipt: any, nIdx: number) => {
		if (hasError) return nIdx > idx && isError(receipt);
  
		// only can find receipts after the idx inputted
		if (nIdx <= idx) return false;
  
		// only can find return receipts
		if (!isReturnData(receipt)) return false;
  
		const hasSameId = receipts[idx]?.to === receipt.id;
		return hasSameId;
	  };
	}
  }
  
  function createReceiptTypeChecker(types: string[]) {
	return (receipt: any) =>
	  types.some((type) => type === receipt?.receiptType);
  }
  
  const isCall = createReceiptTypeChecker(['CALL']);
  const isReturnData = createReceiptTypeChecker(['RETURN_DATA']);
  const isReturn = createReceiptTypeChecker(['RETURN']);
  const isResult = createReceiptTypeChecker(['SCRIPT_RESULT']);
  const isError = createReceiptTypeChecker(['PANIC', 'REVERT']);
  
  function getType(receipt: any) {
	if (receipt?.sender) {
	  return 'FROM_ACCOUNT';
	}
	if (receipt?.contractId ?? receipt?.contractId ?? receipt?.to) {
	  return 'FROM_CONTRACT';
	}
	if (isReturn(receipt) && !receipt?.contractId) {
	  return 'FINAL_RESULT';
	}
	return null;
  }
  
const generate = new Generate();
const output = generate.createOperations(receipts);

console.log(output);
// console.log(JSON.stringify(output, undefined, "  "));
// const depthLimit = 6;

// function render () {
// 	const output = generate.createOperations(receipts);
// 	for (const item of output) {
// 		let depth = 0;
// 		console.log(depth, "-", ">", item.type, item.receipts.length);
// 		renderR(item, depth);
// 	}
// }

// function renderR (item: any, depth: number) {
// 	if (depth++ >= depthLimit) return;
// 	if (!item.receipts) return;
// 	for (const subitem of item.receipts) {
// 		const length = subitem.receipts?.length || 0;
// 		const type = subitem.item.receiptType;
// 		console.log(depth, "-".repeat(depth * 2), ">", type, length, (type === "CALL") ? subitem.item.to : "");
// 		if (length > 0) renderR(subitem, depth);
// 	}
// }

// render();
