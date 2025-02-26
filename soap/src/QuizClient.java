// package soap.src;

// import javax.xml.namespace.QName;
// import jakarta.xml.ws.Service;

// import java.net.MalformedURLException;
// import java.net.URI;
// import java.net.URL;

// public class QuizClient {
//     public static void main(String[] args) {
//         try {

//             URI uri = URI.create("http://127.0.0.1:9876/quiz?wsdl");
//             URL url = uri.toURL();
//             QName qname = new QName("http://src.soap/", "QuizServerImplService");
//             Service ws = Service.create(url, qname);
//             SoapServer quiz = ws.getPort(SoapServer.class);
//             quiz.mensagem("rBendelack", "vasco");
//         } catch(MalformedURLException e){
//             System.out.println(e.getMessage());
//         }
//     }
// }
