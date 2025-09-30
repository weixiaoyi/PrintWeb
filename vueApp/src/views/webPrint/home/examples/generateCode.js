import htmlBase64 from "./base64/htmlBae64";
import pdfBase64 from "./base64/pdfBae64";
import imageBase64 from "./base64/imageBase64";

export const getCommonString = () => {
  return `import webPrintPdf from "web-print-pdf";
  
`;
};

export const getCommonStringReplaceStr = () => {
  return 'import webPrintPdf from "web-print-pdf";';
};

export const getHtmlBase64 = () => {
  return htmlBase64;
};

export const getPdfBase64 = () => {
  return pdfBase64;
};

export const getImageBase64 = () => {
  return imageBase64;
};

export const getCommonOptions = () => {
  return `
    /* pdfOptions arguments（pdfOptions 参数）: 
    * paperFormat: string (optional), Paper format. If set, takes priority over width or height options. Defaults to 'A4', Letter、Legal、Tabloid、Ledger、A0、A1、A2、A3、A4、A5、A6. （仅支持这些固定格式，其它格式可以通过 width,height 自定义，paperFormat 优先于自定义尺寸）
    * width：string | number (optional) Paper width, accepts values labeled with units px、in、cm、mm. (注意自定义尺寸时，不需要设置 paperFormat)
    * height：string | number (optional), Paper height, accepts values labeled with units px、in、cm、mm. (注意自定义尺寸时，不需要设置 paperFormat)
    * displayHeaderFooter: boolean (optional), Display header and footer. Defaults to false
    * headerTemplate: string (optional), HTML template for the print header, Should be valid HTML markup with following classes used to inject printing values into them: 'date': formatted print date; 'title': document title; 'url': document location; 'pageNumber': current page number; 'totalPages': total pages in the document. eg: <span class="pageNumber"><span/>. (模板头html字符串，支持插入特殊的class自动实现日期、页面、总页数等展示功能)
    * footerTemplate:  string (optional), HTML template for the print footer. Should use the same format as the headerTemplate
    * landscape：boolean (optional), Paper orientation. Defaults to false.(是否横向, 默认false, 纵向)
    * margin：Object (optional), Paper margins, defaults to none。top , right, bottom, left, accepts margin values labeled with units px、in、cm、mm. Defaults to 0 (pdf 四周的间距)
    * pageRanges: Array<Object> (optional), Paper ranges to print, e.g., [{from:1,to:5},{from:6,to:6},{from:7,to:10}]. Defaults to the empty, which means print all pages .(打印页面范围, 默认全部)
    * preferCSSPageSize: boolean (optional), Give any CSS @page size declared in the page priority over what is declared in width and height or format options. Defaults to false, which will scale the content to fit the paper size
    * printBackground:  boolean (optional), Print background graphics. Defaults to false. (是否打印背景色)
    * watermark: Object (optional), eg: text watermark: { text:"hello, this is watermark", color:'rgb(0,0,0)', x: 200 |'alignCenter'|'alignLeft'|'alignRight', y: 100 |'alignCenter'|'alignTop'|'alignBottom', size: 20, rows: 4, cols:4, xSpace:20, ySpace:20, angle: 45, opacity:0.5  } or image watermark { base64: "", x: 200 |'alignCenter'|'alignLeft'|'alignRight', y: 100 |'alignCenter'|'alignTop'|'alignBottom', rows: 4, cols:4, angle: 45, xSpace:20, ySpace:20, width: 100, height: 100, opacity:0.5  }. (文字水印或图片水印) 
    * pageNumber: Object (optional), eg: { start: 1, x: 200 |'alignCenter'|'alignLeft'|'alignRight', y: 100 |'alignCenter'|'alignTop'|'alignBottom', format: '{{page}}/{{totalPage}}', color:'rgb(0,0,0)',  size: 20', xSpace: 0, ySpace:0, opacity:1 }. // 设置页码, format也可传递一个字符串函数 eg: "(page,totalPage) => page + '/' + totalPage"
    */
       
    const pdfOptions = {
         paperFormat:'A4', // A0、A1、A2、A3、A4、A5、A6、Letter、Legal、Tabloid、Ledger, or you can self define by set width、height param
         margin: {
             top: '20px', // 顶部间距, 单位：px、in、cm、mm
             bottom: '20px',
             left: '20px',
             right: '20px'
        },
        printBackground: false, // 是否打印css的background背景(背景色、背景图片)
    };
          
    /* printOptions arguments（printOptions参数）：
    * paperFormat: string (optional), A2, A3, A4, A5, A6, Letter、Legal、Tabloid、Ledger, Statement, and it supports selecting one from the list of supported paper formats, which can be found on the preview page  (除了这些固定格式，更多输入项取决于打印机支持的纸张格式，支持从打印支持的纸张格式列表里选择一个作为参数，如 "10x14"、"信封 B6" 等，如果输入了一个不支持的格式，实际打印格式取决于打印机默认的打印纸设置)
    * colorful: boolean (optional), Defaults to false. color or monochrome (彩色或黑白, 默认false, 黑白)
    * landscape：boolean (optional), contents orientation, NOT the rotation of paper which must be pre-set by the choice of printer defaults. Defaults to false. (是否横向, 默认false, 纵向)
    * printerName: string (optional), specify a printer. (指定打印机名字, 默认缺省打印机)
    * pageRanges: Array<Object> (optional), Paper ranges to print, e.g., [{from:1,to:5},{from:6,to:6},{from:7,to:10}]. Defaults to the empty, which means print all pages . (页码范围, 默认全部)
    * copies：number(optional), Number of copies printed (打印份数)
    * duplexMode: enums string (optional), “simplex”（单面打印, 默认）,"duplex"（双面）,“duplexshort”（沿短边双面打印）, “duplexlong”（沿长边双面打印）
    * scaleMode: enums string (optional), noscale: 使用原始页面大小 , shrink：将页面缩小至可打印区域（如果需要） , fit：调整页面至可打印区域. (默认shrink), 具体差异可通过设置 extraOptions 的 action参数为 'preview' 查看
    * bin：num or name (optional), 选择要打印到的纸盘
    */
    const printOptions = {
        paperFormat: 'A4', // A2, A3, A4, A5, A6, Letter、Legal、Tabloid、Ledger, Statement, or a name selectable from your printer settings (所有可选择的纸张格式，可参考预览页面的纸张下拉选项)
    };
    
    /* extraOptions arguments（extraOptions参数）：
    * devtool: boolean (optional), use in development, it can be useAble when debug html. Defaults to false. (开发者工具用于 development 调试html，仅对PDF引擎是本地的 chrome 和 edge 有用)
    * requestTimeout: number (optional),  request network timeout (http、xhr), default 15 (网络超时时间, 默认15秒。此参数应大于等于页面内的xhr timeout设置)
    * cookies: Object (optional),  cookie Object. eg: { key1:value1, key2:value2 } 
    * localStorages: Object (optional),  localStorage Object. eg: { key1:value1, key2:value2 } , every page has a default localStorage key-value { '_printMode_' : 'true' }, to make difference in UI. 为了方便对打印区域做差异化，所有页面都有一个默认的 { '_printMode_' : 'true' } localstorage 值可取用
    * sessionStorages: Object (optional),  sessionStorage Object. eg: { key1:value1, key2:value2 } 
    * httpHeaders: Object (optional), An object containing additional HTTP headers to be sent with every request. eg:{ Authorization: 'string' }, All header values must be strings. 请求头设置 {key,value}
    * action: enums string (optional), "print"、"preview"，default 'print'. The client can decide the preview behavior based on the returned preview address. (行为：打印或预览，默认打印，客户端可根据返回的预览地址，自行决定预览行为)
    * * [key]<string>: (optional), any key-value you want to add. it may be useAble when extraOptions returned (可以添加任何想添加的 key:value, 会原样跟 extraOptions 返回)
    */ 
    const extraOptions = {
        requestTimeout: 15,  // 单位秒（unit second）
        // action:'preview'  // 打印预览模式 （Print Preview Mode）
    };
    
    // await webPrintPdf.utils.setTitle("Web打印管家（Web Expert）");  // 设置标题，永久有效 (Set the print client title to be permanently effective)
    // await webPrintPdf.utils.setThemeColor('rgb(229,182,80)');     // 设置主题色，永久有效 (Set the theme color, permanently effective)
    `;
};
