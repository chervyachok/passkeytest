export default function(delay = 500) {
    return new Promise((resolve) =>
        setTimeout(() => {
            resolve();
        }, delay)
    );
}