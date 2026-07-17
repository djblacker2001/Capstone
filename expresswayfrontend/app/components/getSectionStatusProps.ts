const getSectionStatusProps = (status: string | undefined) => {
    switch (status) {
        case 'Complete':
        case 'Operating':
        case 'Đang hoạt động':
            return { text: 'Đang hoạt động', color: 'green' };

        case 'Under construction':
        case 'Đang thi công':
            return { text: 'Đang thi công', color: 'orange' };

        case 'Extend under construction':
        case 'Đang thi công mở rộng':
            return { text: 'Thi công mở rộng', color: 'purple' };

        case 'Accident':
        case 'Incident':
        case 'Đang gặp sự cố':
            return { text: 'Đang gặp sự cố', color: 'red' };

        case 'Maintenance':
        case 'Đang bảo trì':
            return { text: 'Đang bảo trì', color: 'blue' };

        default:
            return { text: status || 'Chưa xác định', color: 'default' };
    }
};