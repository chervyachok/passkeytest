export default async function({ title, text, url }) {
    if (navigator.share) {
        navigator.share({ title, text, url })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
    }
}