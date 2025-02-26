package soap.src;

import jakarta.jws.WebService;

import jakarta.jws.WebMethod;
import jakarta.jws.soap.SOAPBinding;
import jakarta.jws.soap.SOAPBinding.Style;;

@WebService
@SOAPBinding(style = Style.RPC)
public interface SoapServer {
    @WebMethod  public void mensagem(String username, String palavra) throws Exception;
}