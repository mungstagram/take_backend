export function timeGap(time: Date) {
  const now = new Date().getTime() - 3600 * 1000 * 9;
  const createdTime = new Date(time);
  const timeGap = now - createdTime.getTime();

  let newTimeGap = '';

  if (Math.floor(timeGap / (1000 * 60 * 60 * 24 * 7 * 4)) !== 0) {
    newTimeGap = `${createdTime.getMonth()}월 ${createdTime.getDate()}일`;
  } else if (Math.floor(timeGap / (1000 * 60 * 60 * 24 * 7)) !== 0) {
    newTimeGap = `${Math.floor(timeGap / (1000 * 60 * 60 * 24 * 7))}주 전`;
  } else if (Math.floor(timeGap / (1000 * 60 * 60 * 24)) !== 0) {
    newTimeGap = `${Math.floor(timeGap / (1000 * 60 * 60 * 24))}일 전`;
  } else if (Math.floor(timeGap / (1000 * 60 * 60)) !== 0) {
    newTimeGap = `${Math.floor(timeGap / (1000 * 60 * 60))}시간 전`;
  } else if (Math.floor(timeGap / (1000 * 60)) !== 0) {
    newTimeGap = `${Math.floor(timeGap / (1000 * 60))}분 전`;
  } else {
    newTimeGap = `방금전`;
  }

  return newTimeGap;
}
