package com.suicide.codeConnect_api.service;

import com.suicide.codeConnect_api.entity.Usuario;
import com.suicide.codeConnect_api.exception.EmailUniqueViolationException;
import com.suicide.codeConnect_api.exception.UniqueViolationExcption;
import com.suicide.codeConnect_api.exception.UsuarioNotFoundException;
import com.suicide.codeConnect_api.repository.UsuarioRepository;
import com.suicide.codeConnect_api.web.dto.UsuarioUpdateDTO;
import com.suicide.codeConnect_api.web.dto.mapper.UsuarioMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    // Limpa o cache que lista todos os usuários sempre que um novo é salvo
    @CacheEvict(value = "usuarios", allEntries = true)
    public Usuario salvar(Usuario usuario) {
        if(!usuario.getName().startsWith("@")){
            usuario.setName("@" + usuario.getName());
        }
        if (usuarioRepository.existsByName(usuario.getName())){
            throw new UniqueViolationExcption(
                    String.format("O nome %s já está cadastrado.", usuario.getName())
            );
        }
        if (usuarioRepository.existsByEmail(usuario.getEmail())){
            throw new UniqueViolationExcption(
                    String.format("O email %s já foi cadastrado.", usuario.getEmail())
            );
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    @Transactional
    // Busca no cache 'usuarios' pela chave #id. Se não encontrar, executa o método e armazena o resultado.
    @Cacheable(value = "usuarios", key = "#id")
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id).orElseThrow(
                () -> new UsuarioNotFoundException(String.format("Usuario id=%s não encontrado", id))
        );
    }

    @Transactional
    // Atualiza o cache sempre que os dados do usuário são alterados.
    // Também limpa os caches por email e nome para evitar dados inconsistentes.
    @Caching(
            put = { @CachePut(value = "usuarios", key = "#id") },
            evict = {
                    @CacheEvict(value = "usuarioPorEmail", key = "#result.email"),
                    @CacheEvict(value = "usuarioPorNome", key = "#result.name"),
                    @CacheEvict(value = "usuarios", allEntries = true) // Limpa a lista de todos os usuários
            }
    )
    public Usuario atualizarDados(Long id, UsuarioUpdateDTO dto){
        Usuario usuario= usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario não encontrado"));
        UsuarioMapper.atualizarDados(dto, usuario);
        return usuarioRepository.save(usuario);
    }

    @Transactional
    // Atualiza o cache do usuário com a nova senha.
    @CachePut(value = "usuarios", key = "#id")
    public Usuario editarSenha(Long id, String senhaAtual, String novaSenha, String confirmaSenha) {
        if (!novaSenha.equals(confirmaSenha)){
            throw new RuntimeException("Nova senha está diferente da Confirma senha");
        }
        Usuario user = buscarPorId(id);
        if (!passwordEncoder.matches(senhaAtual, user.getPassword())){ // Use passwordEncoder.matches para comparar
            throw new RuntimeException("Senha atual errada");
        }
        user.setPassword(passwordEncoder.encode(novaSenha)); // Codifique a nova senha
        return user; // Não precisa salvar de novo, pois o objeto já está sendo gerenciado pelo @Transactional
    }

    @Transactional
    // Busca no cache 'usuarioPorEmail'. Se não encontrar, executa e armazena.
    @Cacheable(value = "usuarioPorEmail", key = "#email")
    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email).orElseThrow(
                () -> new UsuarioNotFoundException(" email não encontrado")
        );
    }

    @Transactional
    // Busca no cache 'usuarioPorNome'. Se não encontrar, executa e armazena.
    @Cacheable(value = "usuarioPorNome", key = "#name")
    public Usuario buscarPorNome(String name) {
        return usuarioRepository.findByName(name).orElseThrow(
                () -> new UsuarioNotFoundException(" nome não encontrado")
        );
    }

    @Transactional
    // Busca a lista de todos os usuários no cache 'usuarios'.
    @Cacheable("usuarios")
    public List<Usuario> listarTodos(){
        return usuarioRepository.findAll();
    }
}