package soap.src;

import jakarta.jws.WebService;

// RabbitMQ
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;

@WebService(endpointInterface = "soap.src.SoapServer") // liga a classe à interface
public class SoapServerImpl implements SoapServer {
    private static final String nome_fila = "eventos";
    private Connection conexao;
    private Channel canal;

    public SoapServerImpl () throws Exception {
        // Conectar ao RabbitMQ
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost"); // RabbitMQ rodando localmente
        this.conexao = factory.newConnection();
        this.canal = conexao.createChannel();

        // Declara uma fila (caso não exista)
        this.canal.queueDeclare(nome_fila, false, false, false, null);
    }
    @Override
    public void mensagem(String username, String palavra, Boolean acertou) throws Exception {
        String msg;
        if(acertou)
            msg = String.format("%s acertou a palavra %s", username, palavra);
        else
            msg = String.format("%s tentou a palavra %s e errou", username, palavra);

        this.canal.basicPublish("", nome_fila, null, msg.getBytes());
        System.out.println("Evento publicado: " + msg);
    }

    public void fecharConexao() throws Exception {
        if(this.canal != null) this.canal.close();
        if(this.conexao != null) this.conexao.close();
    }
}