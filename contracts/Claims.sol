pragma solidity ^0.4.23;

contract Claims {
    mapping(address => mapping(address => mapping(bytes32 => bytes32))) claims;

    event Set(
        address indexed issuer,
        address indexed subject,
        bytes32 indexed key,
        bytes32 value,
        uint updatedAt
    );

    event Unset(
        address indexed issuer,
        address indexed subject,
        bytes32 indexed key,
        uint updatedAt
    );

    function set(address subject, bytes32 key, bytes32 value) public {
        claims[msg.sender][subject][key] = value;
        emit Set(msg.sender, subject, key, value, now);
    }


    function get(address issuer, address subject, bytes32 key) public constant returns (bytes32) {
        return claims[issuer][subject][key];
    }

    function unset(address issuer, address subject, bytes32 key) public {
        require(msg.sender == issuer || msg.sender == subject);
        require(claims[issuer][subject][key] != 0);

        delete claims[issuer][subject][key];
        emit Unset(msg.sender, subject, key, now);
    }
}