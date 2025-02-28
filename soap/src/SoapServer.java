package soap.src;

import jakarta.jws.WebService;

import jakarta.jws.WebMethod;
import jakarta.jws.soap.SOAPBinding;
import jakarta.jws.soap.SOAPBinding.Style;;

@WebService // indice que é a interface de um serviço web
@SOAPBinding(style = Style.RPC) // indica que o serviço utilizará a abordagem SOAP 
public interface SoapServer {
    // indica que é um metodo de serviço
    @WebMethod public void mensagem(String username, String palavra, Boolean acertou) throws Exception;
}