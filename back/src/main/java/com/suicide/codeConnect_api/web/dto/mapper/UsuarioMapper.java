package com.suicide.codeConnect_api.web.dto.mapper;

import com.suicide.codeConnect_api.entity.Usuario;
import com.suicide.codeConnect_api.web.dto.UsuarioCreateDto;
import com.suicide.codeConnect_api.web.dto.UsuarioResponseDto;
import com.suicide.codeConnect_api.web.dto.UsuarioUpdateDTO;
import org.modelmapper.ModelMapper;

import java.util.List;
import java.util.stream.Collectors;

public class UsuarioMapper {


    // converte o UsuarioDTO para entidade Usuario
    public static Usuario toUsuario(UsuarioCreateDto createDto){
        return new ModelMapper().map(createDto, Usuario.class);
    }

    // Converte a entidade Usuario para UsuarioDTO
    public static UsuarioResponseDto toDto(Usuario usuario){
        return new ModelMapper().map(usuario, UsuarioResponseDto.class);
    }
    public static List<UsuarioResponseDto> toListDto(List<Usuario> usuarios){
        return usuarios.stream().map(user -> toDto(user)).collect(Collectors.toList());
    }

    public static void atualizarDados(UsuarioUpdateDTO dto, Usuario usuario){
        if (dto.getUsername() != null){
            usuario.setUsername(dto.getUsername());
        }
        if (dto.getDescricao() != null){
            usuario.setDescricao(dto.getDescricao());
        }
        if (dto.getFotoUrl() != null){
            usuario.setFotoUrl(dto.getFotoUrl());
        }
    }
}
