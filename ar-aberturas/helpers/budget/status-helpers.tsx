import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { BUDGET_STATUS } from '@/constants/budget-status';

export const getStatusIcon = (status: string) => {
	switch (status) {
		case BUDGET_STATUS.IN_PROGRESS:
			return <Clock className="h-3.5 w-3.5" />;
		case BUDGET_STATUS.SOLD:
			return <CheckCircle className="h-3.5 w-3.5" />;
		case BUDGET_STATUS.LOST:
			return <XCircle className="h-3.5 w-3.5" />;
		default:
			return <Clock className="h-3.5 w-3.5" />;
	}
};
