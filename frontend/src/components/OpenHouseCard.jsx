import { Calendar, Clock, Info } from 'lucide-react';
import styles from './css_modules/OpenHouseCard.module.css';

function OpenHouseCard({ openHouse }){
	//parse all_data
	let all_data = JSON.parse(openHouse.all_data);

	//get the openhouse data
	const start = all_data.OpenHouseStartTime || 'TBD';
	const end = all_data.OpenHouseEndTime || 'TBD';
	const remarks = all_data.OpenHouseRemarks || 'No remarks provided';
	
	//Format the start date
	const formatDate = (date) => {
		if(!date || date === 'TBD') return 'TBD';
		const parsedDate = new Date(date);
		if(isNaN(parsedDate)) return date;
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}).format(parsedDate)
	};
	
	const formatTime = (date) => {
		if(!date || date === 'TBD') return 'TBD';
		const parsedDate = new Date(date);
		if(isNaN(parsedDate)) return date;
		return new Intl.DateTimeFormat('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		}).format(parsedDate)
	};

	//combine the start and end time
	const formatTimeString = () => {
		const startTime = formatTime(start);
		const endTime = formatTime(end);
		if(startTime && endTime) return `${startTime} - ${endTime}`;
		if(startTime) return `Starts at: ${startTime}`;
		return 'Time TBD';
	};

	return(
		<div className={styles.card}>
			<div className={styles.cardHeader}>
				<div className={styles.infoRow}>
					<Calendar className={styles.icon} size={18} />
					<span className={styles.dateText}>{formatDate(start)}</span>
				</div>
				<div className={styles.infoRow}>
					<Clock className={styles.icon} size={18} />
					<span className={styles.timeText}>{formatTimeString()}</span>
				</div>
			</div>
			<div className={styles.cardBody}>
				<div className={styles.remarksHeader}>
					<Info className={styles.icon} size={15} />
					<span>Remarks</span>
				</div>
				<p className={styles.remarksText}>{remarks}</p>
			</div>
		</div>
	);
}

export default OpenHouseCard
