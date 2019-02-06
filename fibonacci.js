export const fibonacci = (n) => n > 2 ? (fibonacci(n - 1) + fibonacci(n - 2)) : 1;

export const fibonacciWithCache = (n, S3, bucket) => {
    return new Promise(resolve => {
  
    const params = {
        Bucket: bucket,
        Key: 'result.json',
    }

    S3.getObject(params)
        .promise()
        .then((data) => {

            const fileData = JSON.parse(data.Body.toString('utf8'));

            if (fileData[n]) {
                resolve(fileData[n]);
            } else {
                const {res, cachedItem} = fibonacciWithCachedResult(n);

                S3.upload(Object.assign(params, {Body: JSON.stringify(cachedItem)}), (err, data) => {});
                
                resolve(res);
            }
    })
    .catch(() => {               
        
        const {res, cachedItem} = fibonacciWithCachedResult(n);

        S3.upload(Object.assign(params, {Body: JSON.stringify(cachedItem)}), (err, data) => {});
    
        resolve(res);});

    })
}

const fibonacciWithCachedResult = (n) => {
    let arr = [0, 1];
    let cachedItem = {'1': 1}
    for (let i = 2; i < Number(n) + 1; i++) {
        let num = arr[i - 2] + arr[i - 1];
        cachedItem = Object.assign(cachedItem, {[i]: num});
        arr.push(num);
    }
   return {res: arr[n], cachedItem}
}