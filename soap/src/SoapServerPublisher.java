package soap.src;

import jakarta.xml.ws.Endpoint;

public class SoapServerPublisher {
    public static void main(String[] args){
        try {
            Endpoint.publish("http://127.0.0.1:8000/eventos/", new SoapServerImpl());
            System.out.println("Serviço publicado...");
        } catch(Exception e){
            System.out.println(e.getMessage());
        }
    }
}
