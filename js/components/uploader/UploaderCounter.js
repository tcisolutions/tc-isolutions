export function renderUploaderCounter(files = []){

    const total =

        files.reduce(

            (sum,file)=>

                sum + file.size,

            0

        );

    const size =

        (total/1024/1024)

        .toFixed(2);

    return `

        <div class="nx-upload-counter">

            <strong>

                📷 ${files.length} fotografías

            </strong>

            <span>

                💾 ${size} MB

            </span>

        </div>

    `;

}